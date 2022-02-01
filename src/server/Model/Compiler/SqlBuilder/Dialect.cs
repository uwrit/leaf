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
        public string Intersect() => "INTERSECT";
        public string Except() => "EXCEPT";
        public string DateAdd(DateIncrementType incrType, int interval, object date) => $"DATEADD({ToSqlTime(incrType)}, {interval}, {date})";
        public string Convert(ColumnType targetType, object value) => $"CONVERT({ToSqlType(targetType)}, {value})";
        public string DeclareParam(string name, ColumnType type, object value) => $"DECLARE @{name} {ToSqlType(type)} = {value}";

        public string ToSqlType(ColumnType type)
        {
            return type switch
            {
                ColumnType.String  => "NVARCHAR(100)",
                ColumnType.Integer => "INT",
                ColumnType.Decimal => "DECIMAL(18,3)",
                ColumnType.Date    => "DATETIME",
                ColumnType.Boolean => "BIT",
                ColumnType.Guid    => "UNIQUEIDENTIFIER",
                _ => "NVARCHAR(100)",
            };
        }
    }

    public class MySqlDialect : BaseSqlDialect, ISqlDialect
    {
        public string Now() => "NOW()";
        public string Intersect() => "INTERSECT";
        public string Except() => throw new NotImplementedException();
        public string DateAdd(DateIncrementType incrType, int interval, object date) => $"DATETIME_ADD({date}, INTERVAL {interval} {ToSqlTime(incrType)})";
        public string Convert(ColumnType targetType, object value) => $"CONVERT({value}, {ToSqlType(targetType)})";
        public string DeclareParam(string name, ColumnType type, object value) => $"SET @{name} := {value}";

        public string ToSqlType(ColumnType type)
        {
            return type switch
            {
                ColumnType.String  => "VARCHAR(100)",
                ColumnType.Integer => "MEDIUMINT",
                ColumnType.Decimal => "FLOAT",
                ColumnType.Date    => "DATETIME",
                ColumnType.Boolean => "MEDIUMINT",
                ColumnType.Guid    => "CHAR(36)",
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
        public string Intersect() => "INTERSECT";
        public string Except() => "MINUS";
        public string DateAdd(DateIncrementType incrType, int interval, object date) => $"{date} + INTERVAL '{interval}' {ToSqlTime(incrType)}";
        public string Convert(ColumnType targetType, object value) => $"CAST({value} AS {ToSqlType(targetType)}";
        public string DeclareParam(string name, ColumnType type, object value) => $"{name} {ToSqlType(type)} := {value}";

        public string ToSqlType(ColumnType type)
        {
            return type switch
            {
                ColumnType.String  => "NVARCHAR2(100)",
                ColumnType.Integer => "INTEGER",
                ColumnType.Decimal => "FLOAT",
                ColumnType.Date    => "DATE",
                ColumnType.Boolean => "BOOLEAN",
                ColumnType.Guid    => "CHAR(36)",
                _ => "NVARCHAR2(100)",
            };
        }
    }

    public class PostgreSqlDialect : BaseSqlDialect, ISqlDialect
    {
        public string Now() => "NOW()";
        public string Intersect() => "INTERSECT";
        public string Except() => "EXCEPT";
        public string DateAdd(DateIncrementType incrType, int interval, object date) => $"{date} + INTERVAL '{interval}' {ToSqlTime(incrType)}";
        public string Convert(ColumnType targetType, object value) => $"CAST({value} AS {ToSqlType(targetType)}";
        public string DeclareParam(string name, ColumnType type, object value) => $"DECLARE {name} {ToSqlType(type)} = {value}";

        public string ToSqlType(ColumnType type)
        {
            return type switch
            {
                ColumnType.String  => "TEXT",
                ColumnType.Integer => "INTEGER",
                ColumnType.Decimal => "NUMERIC(18,3)",
                ColumnType.Date    => "TIMESTAMP",
                ColumnType.Boolean => "BIT",
                ColumnType.Guid    => "UUID",
                _ => "TEXT",
            };
        }
    }

    public class BigQuerySqlDialect : BaseSqlDialect, ISqlDialect
    {
        public string Now() => "CURRENT_DATETIME()";
        public string Intersect() => throw new NotImplementedException();
        public string Except() => throw new NotImplementedException();
        public string Convert(ColumnType targetType, object value) => $"CAST({value} AS {ToSqlType(targetType)}";
        public string DeclareParam(string name, ColumnType type, object value) => throw new NotImplementedException();

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
                ColumnType.String  => "STRING",
                ColumnType.Integer => "INT64",
                ColumnType.Decimal => "FLOAT64",
                ColumnType.Date    => "DATETIME",
                ColumnType.Boolean => "BOOL",
                ColumnType.Guid    => "STRING",
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
