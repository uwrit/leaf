// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;

namespace Services.Compiler.SqlServer
{
    // TODO(cspital) remove spaces from all consts, update compilers to take that into account
    static class Dialect
    {
        internal const string FIELD_MIN_DATE = "MinDate ";
        internal const string FIELD_MAX_DATE = "MaxDate ";
        internal const string ALIAS_PERSON = "_S";
        internal const string ALIAS_ENCOUNTER = "_E";
        internal const string ALIAS_SUBQUERY = "_T";
        internal const string SQL_SELECT = "SELECT ";
        internal const string SQL_FROM = "FROM ";
        internal const string SQL_WHERE = "WHERE ";
        internal const string SQL_GROUPBY = "GROUP BY ";
        internal const string SQL_COUNT = "COUNT(";
        internal const string SQL_HAVING = "HAVING COUNT(*)";
        internal const string SQL_AND = "AND ";
        internal const string SQL_NOT = "NOT ";
        internal const string SQL_MIN = "MIN";
        internal const string SQL_MAX = "MAX";
        internal const string SQL_IN = "IN ";
        internal const string SQL_SPACE = " ";
        internal const string SQL_UNIONALL = "UNION ALL ";
        internal const string SQL_BETWEEN = "BETWEEN ";
        internal const string SQL_SINGLEQUOTE = "'";
        internal const string SQL_WILDCARD = "%";
        internal const string SQL_LIKE = "LIKE ";
        internal const string SQL_OR = "OR ";
        internal const string SQL_LEFTJOIN = "LEFT JOIN ";
        internal const string SQL_INNERJOIN = "INNER JOIN ";
        internal const string SQL_ON = "ON ";
        internal const string SQL_DATEADD = "DATEADD(";
        internal const string SQL_ISNULL = "IS NULL ";
        internal const string SQL_EXISTS = "EXISTS ";
        internal const string SQL_NOW = "GETDATE()";
        internal const string SQL_INTERSECT = "INTERSECT";
        internal const string SQL_EXCEPT = "EXCEPT";

        internal static readonly string[] ILLEGAL_COMMANDS = { "UPDATE ", "TRUNCATE ", "EXEC ", "DROP ", "INSERT ", "CREATE ", "DELETE ", "MERGE ", "SET ", "WITH " };

        internal static readonly HashSet<string> DATE_FILTER_TYPES = new HashSet<string> { "MINUTE", "HOUR", "DAY", "WEEK", "MONTH", "YEAR" };
    }
}
