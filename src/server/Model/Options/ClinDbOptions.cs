// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;

namespace Model.Options
{
    public class ClinDbOptions : IConnectionString
    {
        public const string MSSQL = "MSSQL";
        public const string MYSQL = "MYSQL";
        public const string MARIADB = "MARIADB";
        public const string POSTGRES = "POSTGRES";
        public const string ORACLE = "ORACLE";
        public const string BIGQUERY = "BIGQUERY";

        public const string SQL = "SQL";
        public const string FHIR = "FHIR";

        string connectionString;
        public string ConnectionString
        {
            get { return connectionString; }
            set
            {
                if (connectionString != null)
                {
                    throw new InvalidOperationException($"{nameof(ClinDbOptions)}.{nameof(ConnectionString)} is immutable");
                }
                connectionString = value;
            }
        }

        int defaultTimeout;
        public int DefaultTimeout
        {
            get { return defaultTimeout; }
            set
            {
                if (defaultTimeout != default)
                {
                    throw new InvalidOperationException($"{nameof(ClinDbOptions)}.{nameof(DefaultTimeout)} is immutable");
                }
                defaultTimeout = value;
            }
        }

        public QueryMode Mode { get; set; }

        public void WithMode(string value)
        {
            var tmp = value.ToUpper();
            if (!IsValidMode(tmp))
            {
                throw new LeafConfigurationException($"{value} is not a supported Mode!");
            }

            switch (tmp)
            {
                case SQL:
                    Mode = QueryMode.SQL;
                    break;
                case FHIR:
                    Mode = QueryMode.FHIR;
                    break;
            }
        }

        public static readonly IEnumerable<string> ValidMode = new string[] { SQL, FHIR };
        static bool IsValidMode(string value) => ValidMode.Contains(value);

        public enum QueryMode
        {
            SQL = 1,
            FHIR = 2
        }

        public RdbmsType Rdbms { get; set; }

        public static readonly IEnumerable<string> ValidRdbms = new string[] { MSSQL, MYSQL, MARIADB, POSTGRES, ORACLE, BIGQUERY };
        static bool IsValidRdbms(string value) => ValidRdbms.Contains(value);

        public void WithRdbms(string value)
        {
            var tmp = value.ToUpper();
            if (!IsValidRdbms(tmp))
            {
                throw new LeafConfigurationException($"{value} is not a supported RDBMS type!");
            }

            switch (tmp)
            {
                case MSSQL:
                    Rdbms = RdbmsType.SqlServer;
                    break;
                case MYSQL:
                    Rdbms = RdbmsType.MySql;
                    break;
                case MARIADB:
                    Rdbms = RdbmsType.MariaDb;
                    break;
                case POSTGRES:
                    Rdbms = RdbmsType.PostgreSql;
                    break;
                case ORACLE:
                    Rdbms = RdbmsType.Oracle;
                    break;
                case BIGQUERY:
                    Rdbms = RdbmsType.BigQuery;
                    break;
            }
        }

        public enum RdbmsType
        {
            SqlServer = 1,
            MySql = 2,
            MariaDb = 3,
            PostgreSql = 4,
            Oracle = 5,
            BigQuery = 6
        }

        public ClinDbCohortOptions Cohort = new ClinDbCohortOptions();

        public class ClinDbCohortOptions
        {
            public const string CTE = "CTE";
            public const string Parallel = "PARALLEL";

            public QueryStrategyOptions QueryStrategy { get; set; }
            public static readonly IEnumerable<string> ValidQueryStrategies = new string[] { CTE, Parallel };
            static bool ValidQueryStrategy(string value) => ValidQueryStrategies.Contains(value);

            public void WithQueryStrategy(string value)
            {
                var tmp = value.ToUpper();
                if (!ValidQueryStrategy(tmp))
                {
                    throw new LeafConfigurationException($"{value} is not a supported a cohort query strategy");
                }

                switch (tmp)
                {
                    case CTE:
                        QueryStrategy = QueryStrategyOptions.CTE;
                        break;
                    case Parallel:
                        QueryStrategy = QueryStrategyOptions.Parallel;
                        break;
                }
            }

            int defaultMaxParallelThreads;
            public int MaxParallelThreads
            {
                get { return defaultMaxParallelThreads; }
                set
                {
                    if (defaultMaxParallelThreads != default)
                    {
                        throw new InvalidOperationException($"{nameof(ClinDbCohortOptions)}.{nameof(MaxParallelThreads)} is immutable");
                    }
                    defaultMaxParallelThreads = value;
                }
            }

            public enum QueryStrategyOptions : ushort
            {
                CTE = 1,
                Parallel = 2
            }
        }

        public ClinDbFhirOptions Fhir = new ClinDbFhirOptions();

        public class ClinDbFhirOptions
        {
            public string ApiURI { get; set; }
            public int Count { get; set; }
        }
    }
}
