// Copyright (c) 2020, UW Medicine Research IT, University of Washington
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
        public bool Ok => DirectConceptsCheck.Ok && DirectQueriesCheck.Ok && DirectImportsCheck.Ok;

        public PreflightConcepts DirectConceptsCheck { get; set; }
        public PreflightQueries DirectQueriesCheck { get; set; }
        public PreflightImports DirectImportsCheck { get; set; }
        public IEnumerable<GlobalPanelFilter> GlobalPanelFilters { get; set; }
        IEnumerable<QueryRef> DirectQueries { get; set; }
        IEnumerable<ImportRef> DirectImports { get; set; }

        public PreflightResources(IEnumerable<QueryRef> directQueries, IEnumerable<ImportRef> directImports, IEnumerable<GlobalPanelFilter> globalPanelFilters)
        {
            DirectQueries = directQueries;
            DirectImports = directImports;
            GlobalPanelFilters = globalPanelFilters;
        }

        public IEnumerable<Concept> Concepts(CompilerOptions opts)
        {
            if (Ok)
            {
                var queryConcepts = DirectQueriesCheck.DirectQueries(DirectQueries).Select(dq => ToConcept(dq, opts));
                var importConcepts = DirectImportsCheck.DirectImports(DirectImports).Select(di => ToConcept(di, opts));
                return DirectConceptsCheck.Concepts
                    .Concat(queryConcepts)
                    .Concat(importConcepts);
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

        Concept ToConcept(ImportRef @ref, CompilerOptions opts)
        {
            return new Concept
            {
                Id = @ref.Id.Value,
                UniversalId = @ref.UniversalId,
                RootId = Guid.Empty,
                IsEncounterBased = true,
                SqlFieldNumeric = $"{opts.Alias}.ValueNumber",
                SqlFieldDate = $"{opts.Alias}.ValueDate",
                SqlSetFrom = $"({@ref.ToQuery(opts)})"
            };
        }

        Concept ToConcept(QueryRef @ref, CompilerOptions opts)
        {
            var alias = $"{opts.Alias}C";
            return new Concept
            {
                Id = @ref.Id.Value,
                UniversalId = @ref.UniversalId,
                RootId = Guid.Empty,
                SqlSetFrom = $"(SELECT {alias}.PersonId AS {opts.FieldPersonId} FROM {opts.AppDb}.app.Cohort AS {alias} WHERE {alias}.QueryId = '{@ref.Id.Value}')",
            };
        }
    }

    public class PreflightResourcesErrors
    {
        public IEnumerable<ConceptPreflightCheckResult> ConceptErrors { get; set; } = new ConceptPreflightCheckResult[] { };
        public IEnumerable<QueryPreflightCheckResult> QueryErrors { get; set; } = new QueryPreflightCheckResult[] { };
        public IEnumerable<ImportPreflightCheckResult> ImportErrors { get; set; } = new ImportPreflightCheckResult[] { };
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

    public class PreflightImports
    {
        public bool Ok => Results.All(r => r.Ok);
        public IEnumerable<ImportPreflightCheckResult> Results { get; set; }
        public IEnumerable<ImportRef> DirectImports(IEnumerable<ImportRef> refs)
        {
            return Results.Where(r => refs.Contains(r.ImportRef, new ImportRefEqualityComparer())).Select(r => r.ImportRef);
        }

        public IEnumerable<ImportPreflightCheckResult> Errors()
        {
            return Results.Select(r => r.Errors())
                          .Where(r => r != null);
        }
    }

    public class ImportPreflightCheckResult
    {
        public ImportRef ImportRef { get; set; }
        public Guid Id { get; set; }
        public string UniversalId { get; set; }
        public bool IsPresent { get; set; }
        public bool IsAuthorized { get; set; }

        public bool Ok => IsPresent && IsAuthorized;

        public ImportPreflightCheckResult Errors()
        {
            if (!Ok)
            {
                return this;
            }
            return null;
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