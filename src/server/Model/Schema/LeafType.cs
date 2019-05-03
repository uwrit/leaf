// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Data.Common;

namespace Model.Schema
{
    public static class SqlServerFieldType
    {
        const string Varchar = "varchar";
        const string Nvarchar = "nvarchar";
        const string DateTime = "datetime";
        const string Date = "date";
        const string Bit = "bit";
        const string UniqueIdentifier = "uniqueidentifier";
        const string Int = "int";
        const string Float = "float";
        const string Money = "money";
        const string Numeric = "numeric";
        const string Real = "real";
        const string SmallInt = "smallint";
        const string SmallMoney = "smallmoney";
        const string Decimal = "decimal";

        public static LeafType LeafDataType(this DbColumn dbColumn)
        {
            switch (dbColumn.DataTypeName)
            {
                case Varchar:
                case Nvarchar:
                    return LeafType.String;

                case Date:
                case DateTime:
                    return LeafType.DateTime;

                case Bit:
                    return LeafType.Bool;

                case UniqueIdentifier:
                    return LeafType.Guid;

                case Int:
                case Float:
                case Money:
                case Numeric:
                case Real:
                case SmallInt:
                case SmallMoney:
                case Decimal:
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
