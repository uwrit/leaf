// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Data.Common;

namespace Model.Schema
{
    public static class SqlFieldType
    {
        public static class SqlServer
        {
            public const string Varchar = "varchar";
            public const string Nvarchar = "nvarchar";
            public const string DateTime = "datetime";
            public const string DateTime2 = "datetime2";
            public const string Date = "date";
            public const string Bit = "bit";
            public const string UniqueIdentifier = "uniqueidentifier";
            public const string Int = "int";
            public const string BigInt = "bigint";
            public const string Float = "float";
            public const string Money = "money";
            public const string Numeric = "numeric";
            public const string Real = "real";
            public const string SmallInt = "smallint";
            public const string SmallMoney = "smallmoney";
            public const string Decimal = "decimal";
        }

        public static class MySql
        {
            public const string Char = "char";
            public const string Varchar = "varchar";
            public const string TinyText = "tinytext";
            public const string Text = "text";
            public const string MediumText = "mediumtext";
            public const string LongText = "longtext";
            public const string Enum = "enum";
            public const string Set = "set";
            public const string TinyInt = "tinyint";
            public const string Bool = "bool";
            public const string Boolean = "boolean";
            public const string SmallInt = "smallint";
            public const string MediumInt = "mediumint";
            public const string Int = "int";
            public const string Integer = "integer";
            public const string BigInt = "bigint";
            public const string Float = "float";
            public const string Double = "double";
            public const string Decimal = "decimal";
            public const string Dec = "dec";
            public const string Date = "date";
            public const string DateTime = "datetime";
            public const string TimeStamp = "timestamp";
            public const string Time = "time";
            public const string Year = "year";
        }

        public static class PostgreSql
        {
            public const string BigInt = "bigint";
            public const string BigSerial = "bigserial";
            public const string Bit = "bit";
            public const string Boolean = "boolean";
            public const string Character = "character";
            public const string Cidr = "cidr";
            public const string Date = "date";
            public const string Double = "double";
            public const string Inet = "inet";
            public const string Integer = "integer";
            public const string Interval = "interval";
            public const string Json = "json";
            public const string MacAddr = "macaddr";
            public const string Money = "money";
            public const string Numeric = "Numeric";
            public const string PgLsn = "pg_lsn";
            public const string Real = "real";
            public const string SmallInt = "smallint";
            public const string SmallSerial = "smallserial";
            public const string Serial = "serial";
            public const string Text = "text";
            public const string Time = "time";
            public const string TimeStamp = "timestamp";
            public const string Uuid = "uuid";
            public const string Xml = "xml";
        }

        public static class Oracle
        {
            public const string Character = "character";
            public const string Char = "char";
            public const string NChar = "nchar";
            public const string Varchar = "varchar";
            public const string Varchar2 = "varchar2";
            public const string NVarchar = "nvarchar";
            public const string NVarchar2 = "nvarchar2";
            public const string Numeric = "numeric";
            public const string Decimal = "decimal";
            public const string Dec = "dec";
            public const string Integer = "integer";
            public const string Int = "int";
            public const string SmallInt = "smallint";
            public const string Float = "float";
            public const string Double = "double";
            public const string Real = "real";
            public const string Long = "long";
            public const string Date = "date";
            public const string TimeStamp = "timestamp";
        }

        public static class BigQuery
        {
            public const string Numeric = "numeric";
            public const string Boolean = "boolean";
            public const string String = "string";
            public const string Time = "time";
            public const string Date = "date";
            public const string TimeZone = "timezone";
            public const string Integer = "integer";
            public const string Float = "float";
        }

        public static LeafType LeafDataType(this DbColumn dbColumn)
        {
            switch (dbColumn.DataTypeName)
            {
                case SqlServer.Varchar:
                case SqlServer.Nvarchar:
                case MySql.Char:
                case MySql.TinyText:
                case MySql.Text:
                case MySql.MediumText:
                case MySql.LongText:
                case MySql.Enum:
                case MySql.Set:
                case MySql.Time:
                case Oracle.NChar:
                case Oracle.NVarchar2:
                case Oracle.Varchar2:
                case Oracle.Character:
                case PostgreSql.Cidr:
                case PostgreSql.Inet:
                case PostgreSql.MacAddr:
                case PostgreSql.Json:
                case PostgreSql.PgLsn:
                case PostgreSql.Xml:
                case BigQuery.String:
                    return LeafType.String;

                case SqlServer.Date:
                case SqlServer.DateTime:
                case SqlServer.DateTime2:
                case MySql.TimeStamp:
                case BigQuery.TimeZone:
                    return LeafType.DateTime;

                case SqlServer.Bit:
                case MySql.Bool:
                case MySql.Boolean:
                    return LeafType.Bool;

                case SqlServer.UniqueIdentifier:
                case PostgreSql.Uuid:
                    return LeafType.Guid;

                case SqlServer.Int:
                case SqlServer.BigInt:
                case SqlServer.Float:
                case SqlServer.Money:
                case SqlServer.Numeric:
                case SqlServer.Real:
                case SqlServer.SmallInt:
                case SqlServer.SmallMoney:
                case SqlServer.Decimal:
                case MySql.MediumInt:
                case MySql.Integer:
                case MySql.Double:
                case MySql.Dec:
                case MySql.Year:
                case Oracle.Long:
                case PostgreSql.BigSerial:
                case PostgreSql.SmallSerial:
                case PostgreSql.Serial:
                    return LeafType.Numeric;

                default:
                    return LeafType.None;
            }
        }
    }

    public enum LeafType
    {
        None = 0,
        String = 1,
        DateTime = 2,
        Bool = 3,
        Guid = 4,
        Numeric = 5
    }
}
