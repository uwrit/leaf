// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;

namespace Model.Options
{
    public class AttestationOptions
    {
        public bool Enabled { get; set; }
        public string[] Text { get; set; }

        public const string TextType = "TEXT";
        public const string HtmlType = "HTML";

        public CustomAttestationType Type { get; set; }
        public static readonly IEnumerable<string> ValidTypeOptions = new string[] { TextType, HtmlType };

        static bool ValidCustomAttestationOption(string value) => ValidTypeOptions.Contains(value.ToUpper());

        public void WithAttestationType(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                Type = CustomAttestationType.None;
                return;
            }

            var tmp = value.ToUpper();
            if (!ValidCustomAttestationOption(tmp))
            {
                throw new LeafConfigurationException($"{value} is not a attestation text type");
            }

            switch (tmp)
            {
                case TextType:
                    Type = CustomAttestationType.Text;
                    break;
                case HtmlType:
                    Type = CustomAttestationType.HTML;
                    break;
            }
        }
    }

    public enum CustomAttestationType : ushort
    {
        None = 0,
        Text = 1,
        HTML = 2
    }
}
