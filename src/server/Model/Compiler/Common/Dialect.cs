// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;

namespace Model.Compiler.Common
{
    public interface ISqlDialect
    {
        public string DateAdd(DateIncrementType incrType, int interval, object date);
        public string Now();
        public string ToSqlType(ColumnType type);
        public string ToSqlTime(DateIncrementType incrType);
        public string Convert(ColumnType targetType, object value);
    }

    public enum ColumnType
    {
        STRING = 1,
        INTEGER = 2,
        DECIMAL = 3,
        DATE = 4,
        BOOLEAN = 5
    }

    public abstract class BaseSqlDialect
    {
        public virtual string ToSqlTime(DateIncrementType incrType)
        {
            return incrType switch
            {
                DateIncrementType.Minute => "MINUTE",
                DateIncrementType.Hour   => "HOUR",
                DateIncrementType.Day    => "DAY",
                DateIncrementType.Week   => "WEEK",
                DateIncrementType.Month  => "MONTH",
                DateIncrementType.Year   => "YEAR",
                _ => ""
            };
        }
    }

    public class TSqlDialect : BaseSqlDialect, ISqlDialect
    {
        public string Now() => "GETDATE()";
        public string DateAdd(DateIncrementType incrType, int interval, object date) => $"DATEADD({ToSqlTime(incrType)}, {interval}, {date})";
        public string Convert(ColumnType targetType, object value) => $"CONVERT({ToSqlType(targetType)}, {value})";

        public string ToSqlType(ColumnType type)
        {
            return type switch
            {
                ColumnType.STRING  => "NVARCHAR(100)",
                ColumnType.INTEGER => "INT",
                ColumnType.DECIMAL => "DECIMAL(18,3)",
                ColumnType.DATE    => "DATETIME",
                ColumnType.BOOLEAN => "BIT",
                _ => "NVARCHAR(100)",
            };
        }
    }

    public class MySqlDialect : BaseSqlDialect, ISqlDialect
    {
        public string Now() => "NOW()";
        public string DateAdd(DateIncrementType incrType, int interval, object date) => $"DATETIME_ADD({date}, INTERVAL {interval} {ToSqlTime(incrType)})";
        public string Convert(ColumnType targetType, object value) => $"CONVERT({value}, {ToSqlType(targetType)})";

        public string ToSqlType(ColumnType type)
        {
            return type switch
            {
                ColumnType.STRING  => "VARCHAR(100)",
                ColumnType.INTEGER => "MEDIUMINT",
                ColumnType.DECIMAL => "FLOAT",
                ColumnType.DATE    => "DATETIME",
                ColumnType.BOOLEAN => "MEDIUMINT",
                _ => "VARCHAR(100)",
            };
        }
    }

    public class MariaDbDialect : MySqlDialect
    {
        
    }

    public class PlSqlDialect : BaseSqlDialect, ISqlDialect
    {
        public string Now() => "SYSDATE";
        public string DateAdd(DateIncrementType incrType, int interval, object date) => $"{date} + INTERVAL '{interval}' {ToSqlTime(incrType)}";
        public string Convert(ColumnType targetType, object value) => $"CAST({value} AS {ToSqlType(targetType)}";

        public string ToSqlType(ColumnType type)
        {
            return type switch
            {
                ColumnType.STRING  => "NVARCHAR2(100)",
                ColumnType.INTEGER => "INTEGER",
                ColumnType.DECIMAL => "FLOAT",
                ColumnType.DATE    => "DATE",
                ColumnType.BOOLEAN => "BOOLEAN",
                _ => "NVARCHAR2(100)",
            };
        }
    }

    public class PostgreSqlDialect : BaseSqlDialect, ISqlDialect
    {
        public string Now() => "NOW()";
        public string DateAdd(DateIncrementType incrType, int interval, object date) => $"{date} + INTERVAL '{interval}' {ToSqlTime(incrType)}";
        public string Convert(ColumnType targetType, object value) => $"CAST({value} AS {ToSqlType(targetType)}";

        public string ToSqlType(ColumnType type)
        {
            return type switch
            {
                ColumnType.STRING  => "TEXT",
                ColumnType.INTEGER => "INTEGER",
                ColumnType.DECIMAL => "NUMERIC(18,3)",
                ColumnType.DATE    => "TIMESTAMP",
                ColumnType.BOOLEAN => "BIT",
                _ => "TEXT",
            };
        }
    }

    public class BigQuerySqlDialect : BaseSqlDialect, ISqlDialect
    {
        public string Now() => "CURRENT_DATETIME()";
        public string Convert(ColumnType targetType, object value) => $"CAST({value} AS {ToSqlType(targetType)}";

        public string DateAdd(DateIncrementType incrType, int interval, object date)
        {
            if (interval < 0)
            {
                return $"DATETIME_SUB({date}, INTERVAL {Math.Abs(interval)} {ToSqlTime(incrType)})";
            }
            return $"DATETIME_ADD({date}, INTERVAL {interval} {ToSqlTime(incrType)})";
        }

        public string ToSqlType(ColumnType type)
        {
            return type switch
            {
                ColumnType.STRING  => "STRING",
                ColumnType.INTEGER => "INT64",
                ColumnType.DECIMAL => "FLOAT64",
                ColumnType.DATE    => "DATETIME",
                ColumnType.BOOLEAN => "BOOL",
                _ => "STRING",
            };
        }
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
            public const string Person = "_S";
            public const string Sequence = "_T";
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
