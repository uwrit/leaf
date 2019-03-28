// Copyright (c) 2019, UW Medicine Research IT
// Developed by Nic Dobbins and Cliff Spital
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Text;
using Services.Compiler.SqlServer;
using Xunit;
using Model.Compiler;
using Model.Options;
using Microsoft.Extensions.Options;

namespace Tests
{
    public class SqlCompilerTests
    {
        #region mockPanels
        Panel singlePanelItem = new Panel
        {
            Index = 0,
            IncludePanel = true,
            SubPanels = new List<SubPanel>
                {
                    new SubPanel
                    {
                        Index = 0,
                        PanelIndex = 0,
                        IncludeSubPanel = true,
                        JoinSequence = new SubPanelJoinSequence
                        {
                            DateIncrementType = DateIncrementType.Day,
                            Increment = 0,
                            SequenceType = SequenceType.Encounter
                        },
                        PanelItems = new List<PanelItem>
                        {
                            new PanelItem
                            {
                                Index = 1,
                                SubPanelIndex = 0,
                                PanelIndex = 0,
                                Concept = new Concept
                                {
                                    SqlFieldDate = "@.OtherDateField",
                                    SqlSetFrom = "Encounter",
                                    SqlSetWhere = "@.Facility = 'HMC'"
                                }
                            }
                        }
                    }
                }
        };
        Panel doublePanelItem = new Panel
        {
            Index = 0,
            IncludePanel = true,
            SubPanels = new List<SubPanel>
                {
                    new SubPanel
                    {
                        Index = 0,
                        PanelIndex = 0,
                        IncludeSubPanel = true,
                        JoinSequence = new SubPanelJoinSequence
                        {
                            DateIncrementType = DateIncrementType.Day,
                            Increment = 0,
                            SequenceType = SequenceType.Encounter
                        },
                        PanelItems = new List<PanelItem>
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
                                    SqlSetWhere = "@.EncounterType = 'ED'"
                                }
                            },
                            new PanelItem
                            {
                                Index = 1,
                                SubPanelIndex = 0,
                                PanelIndex = 0,
                                Concept = new Concept
                                {
                                    SqlFieldDate = "@.OtherDateField",
                                    SqlSetFrom = "Encounter",
                                    SqlSetWhere = "@.Facility = 'HMC'"
                                }
                            }
                        }
                    }
                }
        };
        Panel joinBySequence = new Panel
        {
            Index = 0,
            IncludePanel = true,
            SubPanels = new List<SubPanel>
                {
                    new SubPanel
                    {
                        Index = 0,
                        PanelIndex = 0,
                        IncludeSubPanel = true,
                        JoinSequence = new SubPanelJoinSequence
                        {
                            DateIncrementType = DateIncrementType.Day,
                            Increment = 0,
                            SequenceType = SequenceType.Encounter
                        },
                        PanelItems = new List<PanelItem>
                        {
                            new PanelItem
                            {
                                Index = 0,
                                SubPanelIndex = 0,
                                PanelIndex = 0,
                                Concept = new Concept
                                {
                                    IsEncounterBased = true,
                                    SqlFieldDate = "@.EncounterDate",
                                    SqlSetFrom = "Encounter",
                                    SqlSetWhere = "@.EncounterType = 'ED'"
                                }
                            },
                            new PanelItem
                            {
                                Index = 1,
                                SubPanelIndex = 1,
                                PanelIndex = 0,
                                Concept = new Concept
                                {
                                    IsEncounterBased = true,
                                    SqlFieldDate = "@.Encounter1Date",
                                    SqlSetFrom = "Encounter1",
                                    SqlSetWhere = "@.Facility = 'HMC'"
                                }
                            }
                        }
                    },
                    new SubPanel
                    {
                        Index = 1,
                        PanelIndex = 0,
                        IncludeSubPanel = true,
                        JoinSequence = new SubPanelJoinSequence
                        {
                            DateIncrementType = DateIncrementType.Day,
                            Increment = 0,
                            SequenceType = SequenceType.Encounter
                        },
                        PanelItems = new List<PanelItem>
                        {
                            new PanelItem
                            {
                                Index = 0,
                                SubPanelIndex = 1,
                                PanelIndex = 0,
                                Concept = new Concept
                                {
                                    IsEncounterBased = true,
                                    SqlFieldDate = "@.DiagnosisDate",
                                    SqlSetFrom = "Diagnosis",
                                    SqlSetWhere = "@.DiagnosisType = 'ICD10' AND @.DiagnosisCode = 'E11.2'"
                                }
                            },
                            new PanelItem
                            {
                                Index = 1,
                                SubPanelIndex = 1,
                                PanelIndex = 0,
                                Concept = new Concept
                                {
                                    IsEncounterBased = true,
                                    SqlFieldDate = "@.ProblemDate",
                                    SqlSetFrom = "ProblemList",
                                    SqlSetWhere = "@.ProblemType = 'ICD10' AND @.ProblemCode = 'E11.2'"
                                }
                            }
                        }
                    }
                },
        };
        #endregion

        #region compiler
        IOptions<CompilerOptions> GenerateOmopOptions()
        {
            return Options.Create<CompilerOptions>(new CompilerOptions
            {
                FieldPersonId = "person_id",
                FieldEncounterId = "visit_id",
                Alias = "@"
            });
        }
        IOptions<CohortOptions> GenerateCohortOptions()
        {
            return Options.Create<CohortOptions>(new CohortOptions
            {
                SetCohort = "_LeafCohort_"
            });
        }
        SqlServerCompiler GenerateSqlServerCompiler()
        {
            IOptions<CompilerOptions> compilerOptions = GenerateOmopOptions();
            IOptions<CohortOptions> cohortOptions = GenerateCohortOptions();

            return new SqlServerCompiler(compilerOptions, cohortOptions);
        }
        #endregion   

        [Fact]
        public void Ensure_UnionAll()
        {
            SqlServerCompiler sqlCompiler = GenerateSqlServerCompiler();
            string sql = sqlCompiler.BuildPanelSql(doublePanelItem);

            Assert.Contains("UNION ALL", sql);
        }

        [Fact]
        public void Ensure_Join_By_Encounter_And_Union()
        {
            SqlServerCompiler sqlCompiler = GenerateSqlServerCompiler();
            string sql = sqlCompiler.BuildPanelSql(joinBySequence);

            Assert.Contains("_T0.visit_id = _T1.visit_id", sql);
        }
    }
}
