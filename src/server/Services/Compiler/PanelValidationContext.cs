// Copyright (c) 2019, UW Medicine Research IT
// Developed by Nic Dobbins and Cliff Spital
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using DTO.Compiler;
using Model.Compiler;
using DTO.Cohort;
using Model.Tagging;

namespace Services.Compiler
{
    public class PanelValidationContext
    {
        public Guid? QueryId { get; set; }
        public QueryUrn UniversalId { get; set; }

        public PreflightResources PreflightCheck { get; set; }
        public IReadOnlyCollection<PanelDTO> Requested { get; set; }
        public IReadOnlyCollection<Panel> Allowed { get; set; }

        public bool PreflightPassed => PreflightCheck.Ok;

        public PanelValidationContext() { }

        public PanelValidationContext(IQueryDefinition query, PreflightResources check)
        {
            PreflightCheck = check;
            Requested = query.All;
            Allowed = new Panel[] { };
        }

        public PanelValidationContext(IQueryDefinition query, PreflightResources check, IReadOnlyCollection<Panel> allowed) : this(query, check)
        {
            Allowed = allowed;
        }

        public void SetQueryId(string id)
        {
            if (!string.IsNullOrWhiteSpace(id))
            {
                QueryId = new Guid(id);
            }
        }

        public void SetUniversalId(string urn)
        {
            if (!string.IsNullOrWhiteSpace(urn))
            {
                UniversalId = QueryUrn.From(urn);
            }
        }
    }
}
