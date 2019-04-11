// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;

namespace Model.Compiler.SqlServer
{
    // TODO(cspital) remove spaces from all consts, update compilers to take that into account
    static class Dialect
    {
        public const string FIELD_MIN_DATE = "MinDate ";
        public const string FIELD_MAX_DATE = "MaxDate ";
        public const string ALIAS_PERSON = "_S";
        public const string ALIAS_ENCOUNTER = "_E";
        public const string ALIAS_SUBQUERY = "_T";
        public const string SQL_SELECT = "SELECT ";
        public const string SQL_FROM = "FROM ";
        public const string SQL_WHERE = "WHERE ";
        public const string SQL_GROUPBY = "GROUP BY ";
        public const string SQL_COUNT = "COUNT(";
        public const string SQL_HAVING = "HAVING COUNT(*)";
        public const string SQL_AND = "AND ";
        public const string SQL_NOT = "NOT ";
        public const string SQL_MIN = "MIN";
        public const string SQL_MAX = "MAX";
        public const string SQL_IN = "IN ";
        public const string SQL_SPACE = " ";
        public const string SQL_UNIONALL = "UNION ALL ";
        public const string SQL_BETWEEN = "BETWEEN ";
        public const string SQL_SINGLEQUOTE = "'";
        public const string SQL_WILDCARD = "%";
        public const string SQL_LIKE = "LIKE ";
        public const string SQL_OR = "OR ";
        public const string SQL_LEFTJOIN = "LEFT JOIN ";
        public const string SQL_INNERJOIN = "INNER JOIN ";
        public const string SQL_ON = "ON ";
        public const string SQL_DATEADD = "DATEADD(";
        public const string SQL_ISNULL = "IS NULL ";
        public const string SQL_EXISTS = "EXISTS ";
        public const string SQL_NOW = "GETDATE()";
        public const string SQL_INTERSECT = "INTERSECT";
        public const string SQL_EXCEPT = "EXCEPT";

        public static readonly string[] ILLEGAL_COMMANDS = { "UPDATE ", "TRUNCATE ", "EXEC ", "DROP ", "INSERT ", "CREATE ", "DELETE ", "MERGE ", "SET ", "WITH " };

        public static readonly HashSet<string> DATE_FILTER_TYPES = new HashSet<string> { "MINUTE", "HOUR", "DAY", "WEEK", "MONTH", "YEAR" };
    }
}
