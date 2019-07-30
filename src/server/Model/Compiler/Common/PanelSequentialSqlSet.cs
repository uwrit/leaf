// Copyright (c) 2019, UW Medicine Research IT, University of Washington
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
    class AliasedColumn : UnaliasedColumn
    {
        readonly CompilerOptions compilerOptions;

        public AliasedColumn(string name, IAliasedSet set, CompilerOptions compilerOptions) : base(name, set)
        {
            this.compilerOptions = compilerOptions;
        }

        public override string ToString()
        {
            return base
                .ToString()
                .Replace(compilerOptions.Alias, Set.Alias);
        }
    }

    class JoinedPanelSequentialSqlSet : Join
    {
        public Column PersonId { get; protected set; }
        public Column EncounterId { get; protected set; }
        public Column EventId { get; protected set; }
        public Column Date { get; protected set; }

        public JoinedPanelSequentialSqlSet()
        {

        }

        public JoinedPanelSequentialSqlSet(SubPanelSequentialSqlSet set, string alias, CompilerOptions compilerOptions)
        {
            Set = set;
            Alias = alias;
            ConfigureSet(set, compilerOptions);
        }

        public JoinedPanelSequentialSqlSet(SubPanelSequentialSqlSet set, string alias, JoinType type, CompilerOptions compilerOptions)
        {
            Set = set;
            Alias = alias;
            Type = type;
            ConfigureSet(set, compilerOptions);
        }

        void ConfigureSet(SubPanelSequentialSqlSet set, CompilerOptions compilerOptions)
        {
            PersonId = new Column(set.PersonId.Name, this);
            EncounterId = new Column(set.EncounterId.Name, this);
            Date = new AliasedColumn(set.Date.Name, this, compilerOptions);

            if (set.SubPanel.JoinSequence.SequenceType == SequenceType.Event)
            {
                EventId = new AliasedColumn(set.EventId.Name, this, compilerOptions);
            }
        }
    }

    public class PanelSequentialSqlSet : JoinedSet
    {
        readonly CompilerOptions compilerOptions;

        public Column PersonId { get; protected set; }

        public PanelSequentialSqlSet(Panel panel, CompilerOptions compilerOptions)
        {
            this.compilerOptions = compilerOptions;

            var sps = panel.SubPanels.Select(sp => new SubPanelSequentialSqlSet(panel, sp, compilerOptions));
            var first = sps.ElementAt(0);
            var j1 = new JoinedPanelSequentialSqlSet(first, $"{Dialect.Alias.Sequence}{first.SubPanel.Index}", compilerOptions);
            var anchor = j1;
            var joins = new List<IJoinable>() { j1 };
            var having = new List<IEvaluatableAggregate>();

            /*
             * Create join logic for each subpanel Set.
             */ 
            foreach (var sp in sps.Skip(1))
            {
                var sub = sp.SubPanel;
                var join = GetJoin(anchor, sp, compilerOptions);
                joins.Add(join);

                if (sub.HasCountFilter || !sub.IncludeSubPanel)
                {
                    having.Add(GetHaving(join, sp, compilerOptions));
                }

                if (sub.IncludeSubPanel)
                {
                    anchor = join;
                }
            }

            /*
             * Set PersonId to first joined Set's.
             */
            PersonId = new Column(compilerOptions.FieldPersonId, j1);

            /*
             * Compose.
             */ 
            Select = new[] { PersonId };
            From = joins;
            GroupBy = new[] { PersonId };
            Having = having;
        }

        IEvaluatableAggregate GetHaving(Join join, SubPanelSequentialSqlSet sp, CompilerOptions compilerOptions)
        {
            var sub = sp.SubPanel;
            var col = new AliasedColumn(sp.Date.Name, join, compilerOptions);
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

        JoinedPanelSequentialSqlSet GetJoin(JoinedPanelSequentialSqlSet prec, SubPanelSequentialSqlSet curr, CompilerOptions compilerOptions)
        {
            var seq = curr.SubPanel.JoinSequence;
            var al = $"{Dialect.Alias.Sequence}{curr.SubPanel.Index}";
            var incrType = seq.DateIncrementType.ToString().ToUpper();
            var joinType = curr.SubPanel.IncludeSubPanel ? JoinType.Inner : JoinType.Left;
            var currDate = new AliasedColumn(curr.Date.Name, curr as IAliasedSet, compilerOptions);
            var backOffset = new Expression($"{Dialect.Syntax.DATEADD}({incrType}, -{seq.Increment}, {prec.Date})");
            var forwardOffset = new Expression($"{Dialect.Syntax.DATEADD}({incrType}, {seq.Increment}, {prec.Date})");

            switch (seq.SequenceType)
            {
                /*
                 * Same Encounter.
                 */ 
                case SequenceType.Encounter:

                    return new JoinedPanelSequentialSqlSet(curr, al, joinType, compilerOptions)
                    {
                        On = new[] 
                        {
                            prec.EncounterId == curr.EncounterId
                        }
                    };

                /*
                 * Same Event.
                 */
                case SequenceType.Event:

                    return new JoinedPanelSequentialSqlSet(curr, al, joinType, compilerOptions)
                    {
                        On = new[] 
                        {
                            prec.EventId == curr.EventId
                        }
                    };

                /*
                 * Plus/Minus a time increment.
                 */
                case SequenceType.PlusMinus:

                    return new JoinedPanelSequentialSqlSet(curr, al, joinType, compilerOptions)
                    {
                        On = new IEvaluatable[]
                        {
                            prec.PersonId == curr.PersonId,
                            currDate == backOffset & forwardOffset
                        }
                    };

                /*
                 * Within a following time increment.
                 */
                case SequenceType.WithinFollowing:

                    return new JoinedPanelSequentialSqlSet(curr, al, joinType, compilerOptions)
                    {
                        On = new IEvaluatable[]
                        {
                            prec.PersonId == curr.PersonId,
                            currDate == prec.Date & forwardOffset
                        }
                    };

                /*
                 * Anytime after.
                 */
                case SequenceType.AnytimeFollowing:

                    return new JoinedPanelSequentialSqlSet(curr, al, joinType, compilerOptions)
                    {
                        On = new IEvaluatable[]
                        {
                            prec.PersonId == curr.PersonId,
                            currDate > prec.Date
                        }
                    };

                default:

                    return null;
            }
        }
    }
}
