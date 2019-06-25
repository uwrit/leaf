// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Cohort;
using Xunit;
using System.Collections.Generic;
using System.Linq;

namespace Tests
{
    public class PatientCohortTests
    {
        readonly PatientCohort emptyPatCohort = new PatientCohort();
        readonly PatientCohort patCohort = new PatientCohort
        {
            PatientIds = new HashSet<string>
            {
                "test-pat-1",
                "test-pat-2",
                "test-pat-3"
            }
        };
        readonly string[] patIds = { "test-pat-1", "test-pat-2", "test-pat-3" };

        [Fact]
        public void Count_Returns_Zero_When_PatientIds_Is_Null()
        {
            emptyPatCohort.PatientIds = null;

            Assert.Equal(0, emptyPatCohort.Count);
        }

        [Fact]
        public void Count_Returns_Correct_Count_Of_PatientIds()
        {
            var patIdsCount = 3;

            Assert.Equal(patIdsCount, patCohort.Count);
        }

        [Fact]
        public void Any_Returns_True_If_There_Are_PatientIds()
        {
            Assert.True(patCohort.Any());
        }

        [Fact]
        public void Any_Returns_False_If_There_Are_No_PatientIds()
        {
            Assert.False(emptyPatCohort.Any());
        }

        [Fact]
        public void SeasonedPatients_Returns_All_When_Cohort_Is_Less_Than_maxExport()
        {
            var maxExport = 4;
            var csize = 3;
            var seas = patCohort.SeasonedPatients(maxExport, Guid.NewGuid());

            Assert.Equal(csize, seas.Count(p => patIds.Contains(p.Id) && p.Exported && p.Salt.HasValue));
        }

        [Fact]
        public void SeasonedPatients_Returns_maxExport_When_It_Is_Equal_To_Cohort()
        {
            var maxExport = 3;
            var seas = patCohort.SeasonedPatients(maxExport, Guid.NewGuid());

            Assert.Equal(maxExport, seas.Count(p => patIds.Contains(p.Id) && p.Exported && p.Salt.HasValue));
        }

        [Fact]
        public void SeasonedPatients_Returns_maxExport_When_It_Is_Less_Than_Cohort()
        {
            var maxExport = 2;
            var seas = patCohort.SeasonedPatients(maxExport, Guid.NewGuid());

            Assert.Equal(maxExport, seas.Count(p => patIds.Contains(p.Id) && p.Exported && p.Salt.HasValue));
        }
    }
}
