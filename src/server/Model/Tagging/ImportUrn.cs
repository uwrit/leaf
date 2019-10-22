// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Composure;
using Model.Compiler;

namespace Model.Tagging
{
    public class ImportUrn : Urn
    {
        const string resourceSegment = ResourceType.Import;



        /*
            const parts = [ 'urn', 'leaf', 'import', 'redcap', urn.project ];
            const params = [];

            if (urn.form) {
                parts.push(urn.form);
            }
            if (urn.field) {
                parts.push(urn.field);
            }
            if (urn.value !== undefined) {
                params.push(`val=${urn.value}`)
            }
            if (urn.instance !== undefined) {
                params.push(`inst=${urn.instance}`)
            }
            if (params.length > 0) {
                parts.push(params.join('&'));
            }

            return parts.join(':');
            */

        ImportUrn(string urn) : base(urn)
        {

        }

        public static ImportUrn From(string urn)
        {
            if (string.IsNullOrWhiteSpace(urn))
            {
                return null;
            }
            if (!IsValid(urn, resourceSegment))
            {
                throw new FormatException($"{urn} is not valid, {nameof(ImportUrn)}s must start with {prefix}{resourceSegment}");
            }
            return new ImportUrn(urn);
        }

        public static bool TryParse(string input, out ImportUrn urn)
        {
            urn = default;
            if (string.IsNullOrWhiteSpace(input))
            {
                return false;
            }
            if (!IsValid(input, resourceSegment))
            {
                return false;
            }
            urn = new ImportUrn(input);
            return true;
        }

        internal static bool TryParseUrn(string input, out Urn urn)
        {
            var ok = TryParse(input, out var conceptUrn);
            urn = conceptUrn;
            return ok;
        }

        /*
        public Concept ToConcept()
        {



            
        }
        */
    }
}
