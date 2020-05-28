// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using Model.Validation;
using Microsoft.Extensions.Logging;

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
        public interface IConceptHintSearchService
        {
            Task<IEnumerable<ConceptHint>> HintsAsync(Guid? rootParentId, params string[] terms);
            Task<ConceptEquivalentHint> SynonymAsync(string term);
        }

        readonly IConceptHintSearchService searcher;
        readonly ILogger<ConceptHintSearcher> log;

        public ConceptHintSearcher(IConceptHintSearchService searchService, ILogger<ConceptHintSearcher> log)
        {
            searcher = searchService;
            this.log = log;
        }

        /// <summary>
        /// Provide hints for potential auto-complete targets.
        /// </summary>
        /// <returns>Hints.</returns>
        /// <param name="root">Optional root id to search within.</param>
        /// <param name="term">Search term to provide hints for.</param>
        /// <exception cref="ArgumentNullException"/>
        /// <exception cref="System.Data.Common.DbException"/>
        public async Task<IEnumerable<ConceptHint>> GetHintsAsync(Guid? root, string term)
        {
            Ensure.NotNull(term, nameof(term));

            var terms = term.Split(' ');
            log.LogInformation("Searching hints by terms. Terms:{Terms} Root:{Root}", terms, root);
            var hints = await searcher.HintsAsync(root, terms);
            log.LogInformation("Found hints. Hints:{Hints}", hints);
            return hints;
        }

        /// <summary>
        /// Provide synonyms for a given search term.
        /// </summary>
        /// <returns>Synonym.</returns>
        /// <param name="term">Term.</param>
        /// <exception cref="ArgumentNullException"/>
        /// <exception cref="System.Data.Common.DbException"/>
        public async Task<ConceptEquivalentHint> GetSynonymAsync(string term)
        {
            Ensure.NotNull(term, nameof(term));

            log.LogInformation("Searching synonyms by term. Term:{Term}", term);
            var syn = await searcher.SynonymAsync(term);
            log.LogInformation("Found synonym. Syn:{Syn}", syn);
            return syn;
        }
    }
}
