﻿// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;

namespace Model.Import
{
    public interface IImportMetadata
    {
        public Guid? Id { get; set; }
        public string SourceId { get; set; }
        public ImportType ImportType { get; set; }
    }

    public class ImportMetadata : IImportMetadata
    {
        public Guid? Id { get; set; }
        public string SourceId { get; set; }
        public ImportType ImportType { get; set; }
        public IImportStructure Structure { get; set; }
    }

    public enum ImportType
    {
        REDCapProject = 1,
        MRN = 2
    }
}
