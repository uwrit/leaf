// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;

namespace Model.Tagging
{
    public class ImportUrn : Urn
    {
        const string resourceSegment = ResourceType.Import;

        public bool UseModifier => !string.IsNullOrEmpty(Modifier);

        public new int? Value { get; private set; }
        public int? Instance { get; private set; }
        public string Modifier { get; private set; }
        public string BaseSegment { get; private set; }

        void ParseArgs()
        {
            var raw = base.Value;
            var lastColonIdx = raw.LastIndexOf(':');
            var lastSeg = raw.Substring(lastColonIdx);

            if (lastSeg.IndexOf('=') > -1)
            {
                BaseSegment = raw.Substring(0, lastColonIdx);
                string[] args = lastSeg.Replace(":","").Split('&');
                foreach (var arg in args)
                {
                    string[] keyVal = arg.Split('=');
                    if (keyVal.Length == 2)
                    {
                        string key = keyVal[0];
                        string val = keyVal[1];

                        switch (key)
                        {
                            case "val":
                                Value = Convert.ToInt32(val);
                                break;
                            case "inst":
                                Instance = Convert.ToInt32(val);
                                break;
                            case "mod":
                                Modifier = val;
                                break;
                        }
                    }
                }
            }
            else
            {
                BaseSegment = raw;
            }
        }

        ImportUrn(string urn) : base(urn)
        {
            ParseArgs();
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
    }
}
