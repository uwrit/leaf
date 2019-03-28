// Copyright (c) 2019, UW Medicine Research IT
// Developed by Nic Dobbins and Cliff Spital
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
namespace Model.Options
{
    public class CompilerOptions : IBindTarget
    {
        public string Alias { get; set; }
        public string SetPerson { get; set; }
        public string SetEncounter { get; set; }
        public string FieldPersonId { get; set; }
        public string FieldEncounterId { get; set; }
        public string FieldEncounterAdmitDate { get; set; }
        public string FieldEncounterDischargeDate { get; set; }

        public string AppDb { get; set; }
        public string ClinDb { get; set; }

        public bool DefaultEqual()
        {
            return AppDb == null && ClinDb == null;
        }
    }
}
