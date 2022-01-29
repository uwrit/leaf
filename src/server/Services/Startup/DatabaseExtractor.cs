// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Options;
using System.Data.SqlClient;

namespace Services.Startup
{
    public class ConnectionStringParser
    {
        public ParsedConnectionString Parse(IConnectionString dbOptions)
        {
            var conn = new SqlConnection(dbOptions.ConnectionString);

            return new ParsedConnectionString
            {
                Server = conn.DataSource,
                Database = conn.Database
            };
        }
    }

    public class ParsedConnectionString
    {
        public string Server { get; set; }
        public string Database { get; set; }
    }
}
