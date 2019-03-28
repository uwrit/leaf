// Copyright (c) 2019, UW Medicine Research IT
// Developed by Nic Dobbins and Cliff Spital
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using Model.Compiler;
using System;
using System.Collections.Generic;
using System.Text;

namespace Services.Compiler
{
    public class ConceptHintRecord
    {
        public Guid ConceptId { get; set; }
        public string JsonTokens { get; set; }

        public ConceptHint ToConceptHint()
        {
            return new ConceptHint
            {
                ConceptId = ConceptId,
                Tokens = ConceptHintTokenSerde.Deserialize(JsonTokens)
            };
        }
    }
}
