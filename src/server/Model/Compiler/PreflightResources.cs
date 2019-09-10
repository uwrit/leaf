// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;
using Model.Tagging;
using Model.Options;

namespace Model.Compiler
{
    public class PreflightResources
    {
        public bool Ok => DirectConceptsCheck.Ok && DirectQueriesCheck.Ok;

        public PreflightConcepts DirectConceptsCheck { get; set; }
        public PreflightQueries DirectQueriesCheck { get; set; }
        public IEnumerable<GlobalPanelFilter> GlobalPanelFilters { get; set; }
        IEnumerable<QueryRef> DirectQueries { get; set; }

        public PreflightResources(IEnumerable<QueryRef> directQueries, IEnumerable<GlobalPanelFilter> globalPanelFilters)
        {
            DirectQueries = directQueries;
            GlobalPanelFilters = globalPanelFilters;
        }

        public IEnumerable<Concept> Concepts(CompilerOptions opts)
        {
            if (Ok)
            {
                var queryConcepts = DirectQueriesCheck.DirectQueries(DirectQueries).Select(dq => ToConcept(dq, opts));
                return DirectConceptsCheck.Concepts.Concat(queryConcepts);
            }
            return new Concept[] { };
        }

        public PreflightResourcesErrors Errors()
        {
            if (!Ok)
            {
                return new PreflightResourcesErrors
                {
                    ConceptErrors = DirectConceptsCheck.Errors(),
                    QueryErrors = DirectQueriesCheck.Errors()
                };
            }
            return new PreflightResourcesErrors();
        }

        Concept ToConcept(QueryRef @ref, CompilerOptions opts)
        {
            var alias = $"{opts.Alias}C";
            return new Concept
            {
                Id = @ref.Id.Value,
                UniversalId = @ref.UniversalId,
                RootId = Guid.Empty,
                SqlSetFrom = $"(SELECT {opts.FieldPersonId} = {alias}.PersonId FROM {opts.AppDb}.app.Cohort AS {alias} WHERE {alias}.QueryId = '{@ref.Id.Value}')",
            };
        }
    }

    public class PreflightResourcesErrors
    {
        public IEnumerable<ConceptPreflightCheckResult> ConceptErrors { get; set; } = new ConceptPreflightCheckResult[] { };
        public IEnumerable<QueryPreflightCheckResult> QueryErrors { get; set; } = new QueryPreflightCheckResult[] { };
    }

    public class PreflightQueries
    {
        public bool Ok => Results.All(r => r.Ok);

        public IEnumerable<QueryPreflightCheckResult> Results { get; set; }
        public IEnumerable<QueryRef> DirectQueries(IEnumerable<QueryRef> refs)
        {
            return Results.Where(r => refs.Contains(r.QueryRef, new QueryRefEqualityComparer())).Select(r => r.QueryRef);
        }

        public IEnumerable<QueryPreflightCheckResult> Errors()
        {
            return Results.Select(r => r.Errors())
                          .Where(r => r != null);
        }
    }

    public class QueryPreflightCheckResult
    {
        public QueryRef QueryRef { get; set; }
        public int Ver { get; set; }
        public bool IsPresent { get; set; }
        public bool IsAuthorized { get; set; }
        public ConceptPreflightCheck ConceptCheck { get; set; }

        public bool Ok => IsPresent && IsAuthorized && ConceptCheck.Ok;

        public QueryPreflightCheckResult Errors()
        {
            if (!Ok)
            {
                return new QueryPreflightCheckResult
                {
                    QueryRef = QueryRef,
                    IsPresent = IsPresent,
                    IsAuthorized = IsAuthorized,
                    ConceptCheck = new ConceptPreflightCheck
                    {
                        Results = ConceptCheck.Errors()
                    }
                };
            }
            return null;
        }
    }
}