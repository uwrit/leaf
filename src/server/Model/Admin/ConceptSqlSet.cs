// Copyright (c) 2019, UW Medicine Research IT
// Developed by Nic Dobbins and Cliff Spital
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
namespace Model.Admin
{
    public class ConceptSqlSet
    {
        public int Id { get; set; }
        public bool IsEncounterBased { get; set; }
        public bool IsEventBased { get; set; }
        public string SqlSetFrom { get; set; }
        public string SqlFieldDate { get; set; }
        public string SqlFieldEventId { get; set; }
    }
}
