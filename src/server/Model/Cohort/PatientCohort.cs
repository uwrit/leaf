// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using System.Collections.Generic;
using Model.Compiler;

namespace Model.Cohort
{
    public class PatientCohort
    {
        public Guid? QueryId { get; set; }
        public HashSet<string> PatientIds { get; set; } = new HashSet<string>();
        public IEnumerable<string> SqlStatements { get; set; } = new string[] { };
        public IEnumerable<Panel> Panels { get; set; } = new List<Panel>();

        int count;
        public int Count
        {
            get
            {
                if (PatientIds == null)
                {
                    return 0;
                }

                if (count == default)
                {
                    count = PatientIds.Count();
                }

                return count;
            }
        }

        public bool Any() => PatientIds.Any();

        public IEnumerable<SeasonedPatient> SeasonedPatients(int maxExport, Guid queryId)
        {
            var exporter = SeasonedPatient.Exporter(maxExport, queryId, this);
            var seas = new List<SeasonedPatient>();
            foreach (var id in PatientIds)
            {
                var exported = exporter(id);
                Guid? salt = null;
                if (exported)
                {
                    salt = Guid.NewGuid();
                }
                seas.Add(new SeasonedPatient
                {
                    Id = id,
                    Exported = exported,
                    Salt = salt
                });
            }

            return seas;
        }
    }

    public class SeasonedPatient
    {
        public string Id { get; set; }
        public bool Exported { get; set; }
        public Guid? Salt { get; set; }

        public static Func<string, bool> Exporter(int maxExport, Guid qid, PatientCohort cohort)
        {
            // small cohort, export them all
            var csize = cohort.PatientIds.Count;
            if (csize <= maxExport)
            {
                return (string _) => true;
            }

            // need a subset
            var tmp = new HashSet<string>(cohort.PatientIds);
            var set = new HashSet<string>();
            var rnd = new Random(qid.GetHashCode());
            foreach (var _ in Enumerable.Range(0, maxExport))
            {
                var done = false;
                string candidate;
                do
                {
                    candidate = tmp.ElementAt(rnd.Next(csize - 1));
                    if (set.Add(candidate))
                    {
                        tmp.Remove(candidate);
                        csize--;
                        done = true;
                    }
                } while (!done);
            }

            return (string patid) => set.Contains(patid);
        }
    }
}
