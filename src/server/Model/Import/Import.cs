// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;

namespace Model.Import
{
    public interface IImportRecord
    {
        string Id { get; set; }
        Guid ImportMetadataId { get; set; }
        string SourceModifier { get; set; }
        string ValueString { get; set; }
        decimal? ValueNumber { get; set; }
        DateTime? ValueDate { get; set; }
    }

    public class ImportRecord : IImportRecord
    {
        public string Id { get; set; }
        public Guid ImportMetadataId { get; set; }
        public string PersonId { get; set; }
        public string SourceModifier { get; set; }
        public string SourcePersonId { get; set; }
        public string SourceValue { get; set; }
        public string ValueString { get; set; }
        public decimal? ValueNumber { get; set; }
        public DateTime? ValueDate { get; set; }
    }
}