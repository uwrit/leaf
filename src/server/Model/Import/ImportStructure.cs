// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using Model.Compiler;
using System.Collections.Generic;

namespace Model.Import
{
    public interface IImportStructure
    {
        string Id { get; set; }
    }

    public class REDCapImportStructure : IImportStructure
    {
        public string Id { get; set; }
        public IEnumerable<Concept> Concepts { get; set; }
    }

    public class MrnImportStructure : IImportStructure
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Category { get; set; }
    }
}
