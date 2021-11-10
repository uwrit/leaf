// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using System.Collections.Generic;
using Model.Options;
using Composure;

namespace Model.Compiler.Common
{
    public class PanelSequentialSqlSet : JoinedSet
    {
        public Column PersonId { get; protected set; }

        public PanelSequentialSqlSet(Panel panel, CompilerOptions compilerOptions)
        {
            var sps = panel.SubPanels.Select(sp => new SubPanelSequentialSqlSet(panel, sp, compilerOptions));
            var first = sps.First();
            var j1 = new JoinedSequentialSqlSet(first);
            var joins = new List<IJoinable>() { j1 };
            var having = new List<IEvaluatableAggregate>();
            var anchor = j1;

            /*
             * Add the first subpanel's HAVING clause (if any) separately.
             */ 
            if (first.SubPanel.HasCountFilter)
            {
                having.Add(GetHaving(j1));
            }

            /*
             * Create join logic for each subsequent subpanel Set.
             */
            foreach (var sp in sps.Skip(1))
            {
                var sub = sp.SubPanel;
                var join = GetJoin(anchor, sp);
                joins.Add(join);

                if (sub.HasCountFilter || !sub.IncludeSubPanel)
                {
                    having.Add(GetHaving(join));
                }
                if (sub.IncludeSubPanel)
                {
                    anchor = join;
                }
            }

            /*
             * Set PersonId to first joined Set's.
             */
            PersonId = j1.PersonId;

            /*
             * Compose.
             */ 
            Select  = new[] { PersonId };
            From    = joins;
            GroupBy = new[] { PersonId };
            Having  = having;
        }

        IEvaluatableAggregate GetHaving(JoinedSequentialSqlSet join)
        {
            var sub = (join.Set as SubPanelSequentialSqlSet).SubPanel;
            var uniqueDates = new Expression($"{Dialect.Syntax.COUNT} ({Dialect.Syntax.DISTINCT} {join.Date})");

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

        JoinedSequentialSqlSet GetJoin(JoinedSequentialSqlSet prev, SubPanelSequentialSqlSet currSub)
        {
            /*
             * Get offset expressions.
             */
            var seq = currSub.SubPanel.JoinSequence;
            var incrType = seq.DateIncrementType.ToString().ToUpper();
            var backOffset = new Expression($"{Dialect.Syntax.DATEADD}({incrType}, -{seq.Increment}, {prev.Date})");
            var forwOffset = new Expression($"{Dialect.Syntax.DATEADD}({incrType}, {seq.Increment}, {prev.Date})");

            /*
             * Get Join.
             */
            var type = currSub.SubPanel.IncludeSubPanel ? JoinType.Inner : JoinType.Left;
            var curr = new JoinedSequentialSqlSet(currSub, type);

            switch (seq.SequenceType)
            {
                /*
                 * Same Encounter.
                 */
                case SequenceType.Encounter:

                    curr.On = new[] 
                        {
                            prev.EncounterId == curr.EncounterId
                        };
                    return curr;

                /*
                 * Same Event.
                 */
                case SequenceType.Event:

                    curr.On = new[] 
                        {
                            prev.PersonId == curr.PersonId,
                            prev.EventId == curr.EventId                            
                        };
                    return curr;

                /*
                 * Plus/Minus a time increment.
                 */
                case SequenceType.PlusMinus:

                    curr.On = new IEvaluatable[]
                        {
                            prev.PersonId == curr.PersonId,
                            curr.Date == backOffset & forwOffset
                        };
                    return curr;

                /*
                 * Within a following time increment.
                 */
                case SequenceType.WithinFollowing:

                    curr.On = new IEvaluatable[]
                        {
                            prev.PersonId == curr.PersonId,
                            curr.Date == prev.Date & forwOffset
                        };
                    return curr;

                /*
                 * Anytime after.
                 */
                case SequenceType.AnytimeFollowing:

                    curr.On = new IEvaluatable[]
                        {
                            prev.PersonId == curr.PersonId,
                            curr.Date > prev.Date
                        };
                    return curr;

                default:

                    return null;
            }
        }
    }
}
