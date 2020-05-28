// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using Model.Tagging;

namespace Model.Compiler
{
    public class PanelValidationContext
    {
        public Guid? QueryId { get; set; }
        public QueryUrn UniversalId { get; set; }

        public PreflightResources PreflightCheck { get; set; }
        public IEnumerable<IPanelDTO> Requested { get; set; }
        public IEnumerable<Panel> Allowed { get; set; }

        public bool PreflightPassed => PreflightCheck.Ok;

        public PanelValidationContext() { }

        public PanelValidationContext(IQueryDefinition query, PreflightResources check)
        {
            PreflightCheck = check;
            Requested = query.All();
            Allowed = new Panel[] { };
        }

        public PanelValidationContext(IQueryDefinition query, PreflightResources check, IEnumerable<Panel> allowed) : this(query, check)
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
