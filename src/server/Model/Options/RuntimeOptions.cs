// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;

namespace Model.Options
{
    public class RuntimeOptions : IEnabled
    {
        public const string Full = @"FULL";
        public const string Gateway = @"GATEWAY";

        public RuntimeMode Runtime { get; set; }
        public bool Enabled => Runtime == RuntimeMode.Full;

        public static readonly IEnumerable<string> ValidRuntimes = new string[] { Full, Gateway };

        static bool ValidRuntime(string value) => ValidRuntimes.Contains(value);

        public RuntimeOptions WithRuntime(string value)
        {
            var tmp = value.ToUpper();
            if (!ValidRuntime(tmp))
            {
                throw new LeafConfigurationException($"{value} is not a supported a runtime mode");
            }

            switch (tmp)
            {
                case Full:
                    Runtime = RuntimeMode.Full;
                    break;
                case Gateway:
                    Runtime = RuntimeMode.Gateway;
                    break;
            }

            return this;
        }
    }

    public enum RuntimeMode : ushort
    {
        Full = 1,
        Gateway = 2
    }
}
