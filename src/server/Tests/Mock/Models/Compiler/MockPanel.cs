// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using Model.Compiler;

namespace Tests.Mock.Models.Compiler
{
    public static class MockPanel
    {
        public static Panel Panel = new Panel
        {
            Index = 0,
            IncludePanel = true,
            DateFilter = new DateBoundary(),
            SubPanels = new List<SubPanel>()
            {
                new SubPanel
                {
                    Index = 0,
                    PanelIndex = 0,
                    IncludeSubPanel = true,
                    JoinSequence = new SubPanelJoinSequence(),
                    PanelItems = new List<PanelItem>()
                    {
                        new PanelItem
                        {
                            Index = 0,
                            SubPanelIndex = 0,
                            PanelIndex = 0,
                            Concept = new Concept
                            {
                                SqlFieldDate = "@.DateField",
                                SqlSetFrom = "Encounter",
                                SqlSetWhere = "@.EncounterType = 'ED'",
                                IsEncounterBased = true
                            }
                        }
                    }
                }
            }
        };

        public static Panel BasicPanel = new Panel
        {
            Index = 0,
            IncludePanel = true,
            SubPanels = new List<SubPanel>()
        };

        public static SubPanel SubPanel = new SubPanel
        {
            Index = 0,
            PanelIndex = 0,
            IncludeSubPanel = true,
            PanelItems = new List<PanelItem>()
        };

        public static PanelItem EdEnc = new PanelItem
        {
            Index = 0,
            SubPanelIndex = 0,
            PanelIndex = 0,
            Concept = new Concept
            {
                SqlFieldDate = "@.DateField",
                SqlSetFrom = "Encounter",
                SqlSetWhere = "@.EncounterType = 'ED'",
                IsEncounterBased = true
            }
        };

        public static PanelItem HmcEnc = new PanelItem
        {
            Index = 1,
            SubPanelIndex = 0,
            PanelIndex = 0,
            Concept = new Concept
            {
                SqlFieldDate = "@.DateField",
                SqlSetFrom = "Encounter",
                SqlSetWhere = "@.Facility = 'HMC'",
                IsEncounterBased = true
            }
        };

        public static SubPanelJoinSequence EncJoin = new SubPanelJoinSequence
        {
            SequenceType = SequenceType.Encounter
        };

        public static SubPanelJoinSequence EventJoin = new SubPanelJoinSequence
        {
            SequenceType = SequenceType.Event
        };

        public static SubPanelJoinSequence AnytimeAfterJoin = new SubPanelJoinSequence
        {
            SequenceType = SequenceType.AnytimeFollowing
        };

        public static SubPanelJoinSequence PlusMinusJoin = new SubPanelJoinSequence
        {
            SequenceType = SequenceType.PlusMinus,
            Increment = 3,
            DateIncrementType = DateIncrementType.Month
        };

        public static SubPanelJoinSequence WithinFollowingJoin = new SubPanelJoinSequence
        {
            SequenceType = SequenceType.WithinFollowing,
            Increment = 2,
            DateIncrementType = DateIncrementType.Day
        };
    }
}
