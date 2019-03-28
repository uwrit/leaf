// Copyright (c) 2019, UW Medicine Research IT
// Developed by Nic Dobbins and Cliff Spital
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
namespace API.Options
{
    public static partial class Config
    {
        public static class Compiler
        {
            public const string Section = @"Compiler";
            public const string Alias = @"Compiler:Alias";
            public const string SetPerson = @"Compiler:SetPerson";
            public const string SetEncounter = @"Compiler:SetEncounter";
            public const string FieldPersonId = @"Compiler:FieldPersonId";
            public const string FieldEncounterId = @"Compiler:FieldEncounterId";
            public const string FieldEncounterAdmitDate = @"Compiler:FieldEncounterAdmitDate";
            public const string FieldEncounterDischargeDate = @"Compiler:FieldEncounterDischargeDate";
        }
    }
}
