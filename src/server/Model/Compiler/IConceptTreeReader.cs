// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Model.Compiler
{
    public interface IConceptTreeReader
    {
        Task<Concept> GetAsync(Guid id);
        Task<IEnumerable<Concept>> GetAsync(HashSet<Guid> ids);
        Task<IEnumerable<Concept>> GetAsync(HashSet<string> universalIds);

        Task<IEnumerable<Concept>> GetChildrenAsync(Guid parentId);
        Task<IEnumerable<Concept>> GetWithParentsAsync(HashSet<Guid> ids);
        Task<IEnumerable<Concept>> GetWithParentsBySearchTermAsync(Guid? rootId, string[] terms);
        Task<IEnumerable<Concept>> GetRootsAsync();

        Task<ConceptTree> GetTreetopAsync();
    }
}
