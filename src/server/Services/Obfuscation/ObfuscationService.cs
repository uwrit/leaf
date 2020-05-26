// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using System.Text;
using System.Collections.Generic;
using System.Security.Cryptography;
using Model.Obfuscation;
using Model.Options;
using Model.Cohort;
using Model.Compiler;

namespace Services.Obfuscation
{
    public class ObfuscationService : IObfuscationService
    {
        readonly MD5 md5;

        public ObfuscationService()
        {
            md5 = MD5.Create();
        }

        public void Obfuscate(ref PatientCount count, PanelValidationContext ctx, ObfuscationOptions opts)
        {
            if (!opts.Enabled)
            {
                return;
            }

            // If low cell sizes should be masked and count less than or equal to threshold, set to threshold.
            if (opts.LowCellSizeMasking.Enabled && count.Value <= opts.LowCellSizeMasking.Threshold)
            {
                count.Value = opts.LowCellSizeMasking.Threshold;
                count.PlusMinus = opts.LowCellSizeMasking.Threshold;
                count.WithinLowCellThreshold = true;
                return;
            }

            // Bail if noise obfuscation not enabled
            if (!opts.Noise.Enabled)
            {
                return;
            }

            // Ensure that variations of the same query (with concepts and panels moved around but the query logic identical)
            // always returns the same string of Guid Ids for concepts.
            var orderedIds = GetDeterministicConceptIdsAsString(ctx.Allowed);

            // Hash into a byte array.
            var hashed = md5.ComputeHash(Encoding.UTF8.GetBytes(orderedIds));

            // Seed a random number generator from the hash.
            var generator = new Random(BitConverter.ToInt32(hashed, 0));

            // Compute a random shifted value between the lower and upper bounds
            var shift = 0;
            while (shift == 0)
            {
                shift = generator.Next(opts.Noise.LowerBound, opts.Noise.UpperBound);
            }

            count.Value += shift;
            count.PlusMinus = Math.Max(Math.Abs(opts.Noise.LowerBound), Math.Abs(opts.Noise.UpperBound));
        }

        string GetDeterministicConceptIdsAsString(IEnumerable<Panel> panels)
        {
            // Clone the panels and create a new enumerable with each panel item id ordered
            // within each subpanel such that the subpanels become an array of ordered Guids
            // concatenated into a string.
            var ordered1 = panels.ToList().Select(p =>
                new
                {
                    SubPanels = p.SubPanels.Select(sp =>
                        new
                        {
                            Ids = string.Join(',', sp.PanelItems.Select(pi => pi.Concept.Id).OrderBy(id => id))
                        })
                });

            // Concatenate the Guids for each subpanel in each panel into a string of ordered
            // Guids for the entire panel.
            var ordered2 = ordered1.Select(p => string.Join(',', p.SubPanels.Select(sp => sp.Ids))).OrderBy(p => p);

            // Return the ordered panels concatenated into a single string.
            return string.Join(',', ordered2);
        }
    }
}
