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

        public PanelSequentialSqlSet(Panel panel)
        {
            this.panel = panel;

            var sps = panel.SubPanels.Select(sp => new SubPanelSequentialSqlSet(panel, sp));
            var prev = sps.ElementAt(0);
            var joins = new List<IJoinable>() { new Join { Set = prev, Alias = prev.Alias } };

            foreach (var sp in sps.Skip(1))
            {
                var join = GetJoin(prev, sp);
                joins.Add(join);

                prev = sp;
            }

            From = joins;
        }

        Join GetJoin(SubPanelSequentialSqlSet prec, SubPanelSequentialSqlSet curr)
        {
            var seq = curr.JoinSequence;
            var incrType = seq.DateIncrementType.ToString().ToUpper();
            var backOffset = new Expression($"{Dialect.Syntax.DATEADD}({incrType}, -{seq.Increment}, {prec.Date})");
            var forwardOffset = new Expression($"{Dialect.Syntax.DATEADD}({incrType}, {seq.Increment}, {prec.Date})");

            switch (seq.SequenceType)
            {
                /*
                 * Same Encounter.
                 */ 
                case SequenceType.Encounter:

                    return new Join(curr, curr.Alias, JoinType.Inner)
                    {
                        On = new[] { prec.EncounterId == curr.EncounterId }
                    };

                /*
                 * Same Event.
                 */
                case SequenceType.Event:

                    return new Join(curr, curr.Alias, JoinType.Inner)
                    {
                        On = new[] { prec.EventId == curr.EventId }
                    };

                /*
                 * Plus/Minus a time increment.
                 */
                case SequenceType.PlusMinus:

                    return new Join(curr, curr.Alias, JoinType.Inner)
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

                    return new Join(curr, curr.Alias, JoinType.Inner)
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

                    return new Join(curr, curr.Alias, JoinType.Inner)
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
