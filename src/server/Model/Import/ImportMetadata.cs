// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using Model.Admin.Compiler;

namespace Model.Import
{
    public class ImportMetadata : IConstrainedResource
    {
        public Guid Id { get; set; }
        public string SourceId { get; set; }
        public ImportType Type { get; set; }
        public string StructureJson { get; set; }
        public IEnumerable<Constraint> Constraints { get; set; }
        public DateTime? Created { get; set; }
        public DateTime? Updated { get; set; }
    }

    public class ImportMetadataDTO : ImportMetadata
    {
        public ImportMetadata ToImportMetadata()
        {
            return new ImportMetadata
            {
                Id = Id,
                SourceId = SourceId,
                Type = Type,
                StructureJson = StructureJson,
                Constraints = Constraints,
                Created = Created,
                Updated = Updated
            };
        }
    }

    public enum ImportType
    {
        REDCapProject = 1,
        MRN = 2
    }
}
