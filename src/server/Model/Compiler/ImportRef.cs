// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using Model.Tagging;
using System;
using System.Collections.Generic;
using System.Text;

namespace Model.Compiler
{
    public class ImportRef
    {
        public Guid? Id { get; set; }
        public ImportUrn UniversalId { get; set; }

        public ImportRef()
        {

        }

        public ImportRef(ImportUrn urn)
        {
            UniversalId = urn;
        }

        public ImportRef(Guid? id, ImportUrn urn)
        {
            Id = id;
            UniversalId = urn;
        }

        public ImportRef(string identifier)
        {
            if (Guid.TryParse(identifier, out var guid))
            {
                Id = guid;
            }
            else if (ImportUrn.TryParse(identifier, out var urn))
            {
                UniversalId = urn;
            }
            else
            {
                throw new FormatException($"Query identifier {identifier} is not a valid Guid or Urn");
            }
        }

        public bool UseUniversalId()
        {
            return UniversalId != null;
        }
    }
}
