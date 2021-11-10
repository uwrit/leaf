// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using Model.Compiler;

namespace Tests.Mock.Models.Obfuscation
{
    public static class MockPanel
    {
        public static PanelValidationContext Context()
        {
            return new PanelValidationContext
            {
                Allowed = new List<Panel>
                {
                    new Panel
                    {
                        SubPanels = new List<SubPanel>
                        {
                            new SubPanel
                            {
                                PanelItems = new List<PanelItem>
                                {
                                    new PanelItem
                                    {
                                        Concept = new Concept
                                        {
                                            Id = Guid.NewGuid()
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            };
        }
    }
}
