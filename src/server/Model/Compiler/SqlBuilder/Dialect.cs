// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;

namespace Model.Compiler.SqlBuilder
{
    public interface ISqlDialect
    {
        public string Now();
        public string Intersect();
        public string Except();
        public string DateAdd(DateIncrementType incrType, int interval, object date);
        public string ToSqlType(ColumnType type);
        public string ToSqlTime(DateIncrementType incrType);
        public string ToSqlParamName(string name);
        public string Convert(ColumnType targetType, object value);
        public string DeclareParam(string name, ColumnType type, object value);
    }

    public enum ColumnType
    {
        String = 1,
        Integer = 2,
        Decimal = 3,
        Date = 4,
        Boolean = 5,
        Guid = 6
    }

    static class SqlCommon
    {
        public static class Field
        {
            public const string MinDate = "MinDate";
            public const string MaxDate = "MaxDate";
        }

        public static class Alias
        {
            public const string Person = "S";
            public const string Sequence = "T";
        }

        public static class Syntax
        {
            public const string Count = "COUNT";
            public const string Distinct = "DISTINCT";
        }

        public static readonly string[] IllegalCommands = { "UPDATE ", "TRUNCATE ", "EXEC ", "DROP ", "INSERT ", "CREATE ", "DELETE ", "MERGE ", "SET " };

        public static readonly HashSet<string> DateFilterTypes = new HashSet<string> { "MINUTE", "HOUR", "DAY", "WEEK", "MONTH", "YEAR" };
    }
}
