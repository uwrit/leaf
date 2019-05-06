// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Model.Validation;

namespace Model.Search
{
    /// <summary>
    /// Encapsulates Leaf's search and auto-complete use cases.
    /// </summary>
    /// <remarks>
    /// Required services throw exceptions that bubble up.
    /// </remarks>
    public class ConceptHintSearcher
    {
        readonly IConceptHintSearchService searcher;

        public ConceptHintSearcher(IConceptHintSearchService searchService)
        {
            searcher = searchService;
        }

        /// <summary>
        /// Provide hints for potential auto-complete targets.
        /// </summary>
        /// <returns>Hints.</returns>
        /// <param name="root">Optional root id to search within.</param>
        /// <param name="term">Search term to provide hints for.</param>
        /// <exception cref="ArgumentNullException"/>
        public async Task<IEnumerable<ConceptHint>> GetHintsAsync(Guid? root, string term)
        {
            Ensure.NotNull(term, nameof(term));

            var terms = term.Split(' ');
            return await searcher.HintsAsync(root, terms);
        }

        /// <summary>
        /// Provide synonyms for a given search term.
        /// </summary>
        /// <returns>Synonym.</returns>
        /// <param name="term">Term.</param>
        /// <exception cref="ArgumentNullException"/>
        public async Task<ConceptEquivalentHint> GetSynonymAsync(string term)
        {
            Ensure.NotNull(term, nameof(term));

            return await searcher.SynonymAsync(term);
        }
    }
}
