// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;

namespace Model.Tagging
{
    public class DatasetQueryUrn : Urn
    {
        const string resourceSegment = ResourceType.Dataset;

        DatasetQueryUrn(string urn) : base(urn)
        {

        }

        public static DatasetQueryUrn From(string urn)
        {
            if (string.IsNullOrWhiteSpace(urn))
            {
                return null;
            }
            if (!IsValid(urn, resourceSegment))
            {
                throw new FormatException($"{urn} is not valid, {nameof(DatasetQueryUrn)}s must start with {prefix}{resourceSegment}");
            }
            return new DatasetQueryUrn(urn);
        }

        public static bool TryParse(string input, out DatasetQueryUrn urn)
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
            urn = new DatasetQueryUrn(input);
            return true;
        }
    }
}
