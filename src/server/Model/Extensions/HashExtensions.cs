// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
namespace Model.Extensions
{
    public static class HashExtensions
    {
        public static int GetConsistentHashCode(this string str)
        {
            unchecked
            {
                char TERM = '\0';
                int hash1 = 5381;
                int hash2 = hash1;

                for (var i = 0; i < str.Length && str[i] != TERM; i += 2)
                {
                    hash1 = ((hash1 << 5) + hash1) ^ str[i];
                    if (i == str.Length - 1 || str[i + 1] == TERM)
                    {
                        break;
                    }
                    hash2 = ((hash2 << 5) + hash2) ^ str[i + 1];
                }

                return hash1 + (hash2 * 1_566_083_941);
            }
        }
    }
}
