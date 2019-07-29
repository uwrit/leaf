// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using System.Collections.Generic;
using Microsoft.Extensions.Options;
using Model.Options;
using Composure;

namespace Model.Compiler.Common
{
    public class PanelSequentialSqlSet : JoinedSet
    {
        readonly CompilerOptions compilerOptions;
        readonly Panel panel;

        public Column PersonId { get; protected set; }

        public PanelSequentialSqlSet(Panel panel)
        {
            this.panel = panel;

            var sps = panel.SubPanels.Select(sp => new SubPanelSequentialSqlSet(panel, sp));
            var first = sps.ElementAt(0);
            var prev = first;
            var j1 = new Join { Set = first, Alias = first.Alias };
            var joins = new List<IJoinable>() { j1 };
            var having = new List<IEvaluatableAggregate>();

            foreach (var sp in sps.Skip(1))
            {
                var sub = sp.SubPanel;
                var join = GetJoin(prev, sp);
                joins.Add(join);

                if (sub.HasCountFilter || !sub.IncludeSubPanel)
                {
                    having.Add(GetHaving(join, sp));
                }

                prev = sp;
            }

            SetSelect(j1);
            From = joins;
            Having = having;
        }

        void SetSelect(Join firstJoin)
        {
            PersonId = new Column(compilerOptions.FieldPersonId, firstJoin);
            Select = new[] { PersonId };
            GroupBy = new[] { PersonId };
        }

        IEvaluatableAggregate GetHaving(Join join, SubPanelSequentialSqlSet sp)
        {
            var sub = sp.SubPanel;
            var col = new Column(sp.Date.Name, join);
            var uniqueDates = new Expression($"{Dialect.Syntax.COUNT} ({Dialect.Syntax.DISTINCT} {col})");

            if (sub.IncludeSubPanel)
            {
                return uniqueDates >= sub.MinimumCount;
            }
            if (!sub.IncludeSubPanel && sub.HasCountFilter)
            {
                return uniqueDates < sub.MinimumCount;
            }

            return uniqueDates == 0;
        }

        Join GetJoin(SubPanelSequentialSqlSet prec, SubPanelSequentialSqlSet curr)
        {
            var seq = curr.SubPanel.JoinSequence;
            var incrType = seq.DateIncrementType.ToString().ToUpper();
            var joinType = curr.SubPanel.IncludeSubPanel ? JoinType.Inner : JoinType.Left;
            var backOffset = new Expression($"{Dialect.Syntax.DATEADD}({incrType}, -{seq.Increment}, {prec.Date})");
            var forwardOffset = new Expression($"{Dialect.Syntax.DATEADD}({incrType}, {seq.Increment}, {prec.Date})");

            switch (seq.SequenceType)
            {
                /*
                 * Same Encounter.
                 */ 
                case SequenceType.Encounter:

                    return new Join(curr, curr.Alias, joinType)
                    {
                        On = new[] { prec.EncounterId == curr.EncounterId }
                    };

                /*
                 * Same Event.
                 */
                case SequenceType.Event:

                    return new Join(curr, curr.Alias, joinType)
                    {
                        On = new[] { prec.EventId == curr.EventId }
                    };

                /*
                 * Plus/Minus a time increment.
                 */
                case SequenceType.PlusMinus:

                    return new Join(curr, curr.Alias, joinType)
                    {
                        On = new IEvaluatable[]
                        {
                            prec.PersonId == curr.PersonId,
                            curr.Date == backOffset & forwardOffset
                        }
                    };

                /*
                 * Within a following time increment.
                 */
                case SequenceType.WithinFollowing:

                    return new Join(curr, curr.Alias, joinType)
                    {
                        On = new IEvaluatable[]
                        {
                            prec.PersonId == curr.PersonId,
                            curr.Date == prec.Date & forwardOffset
                        }
                    };

                /*
                 * Anytime after.
                 */
                case SequenceType.AnytimeFollowing:

                    return new Join(curr, curr.Alias, joinType)
                    {
                        On = new IEvaluatable[]
                        {
                            prec.PersonId == curr.PersonId,
                            curr.Date > prec.Date
                        }
                    };

                default:
                    return null;
            }
        }
    }
}
