// Copyright (c) 2019, UW Medicine Research IT
// Developed by Nic Dobbins and Cliff Spital
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Data.SqlClient;
using System.Collections.Generic;
using Model.Compiler;

namespace Services.Cohort
{
    public interface IDemographicSchemaMappingProvider
    {
        DemographicSchema IdentifiedSchema(SqlDataReader reader);
        DemographicSchema AnonymizedSchema(SqlDataReader reader);
    }

    public class DemographicSchema : Dictionary<string, int> { }

    public static class DemographicSchemaColumns
    {
        public const string Exported = "Exported";
        public const string Salt = "Salt";
        public const string PersonId = "personId";
        public const string AddressPostalCode = "addressPostalCode";
        public const string AddressState = "addressState";
        public const string Ethnicity = "ethnicity";
        public const string Gender = "gender";
        public const string Language = "language";
        public const string MaritalStatus = "maritalStatus";
        public const string Race = "race";
        public const string Religion = "religion";
        public const string IsMarried = "marriedBoolean";
        public const string IsHispanic = "hispanicBoolean";
        public const string IsDeceased = "deceasedBoolean";
        public const string BirthDate = "birthDate";
        public const string DeathDate = "deceasedDateTime";
        public const string Name = "name";
        public const string Mrn = "mrn";

        // NOTE(cspital) source of truth for the app.DemographicQuery.SqlSelectors field
        public static readonly SqlFieldSelector[] Order = {
            new SqlFieldSelector { Column = PersonId, Type = "string", Phi = true, Mask = true },
            new SqlFieldSelector { Column = AddressPostalCode, Type = "string", Phi = false, Mask = false },
            new SqlFieldSelector { Column = AddressState, Type = "string", Phi = false, Mask = false },
            new SqlFieldSelector { Column = Ethnicity, Type = "string", Phi = false, Mask = false },
            new SqlFieldSelector { Column = Gender, Type = "string", Phi = false, Mask = false },
            new SqlFieldSelector { Column = Language, Type = "string", Phi = false, Mask = false },
            new SqlFieldSelector { Column = MaritalStatus, Type = "string", Phi = false, Mask = false },
            new SqlFieldSelector { Column = Race, Type = "string", Phi = false, Mask = false },
            new SqlFieldSelector { Column = Religion, Type = "string", Phi = false, Mask = false },
            new SqlFieldSelector { Column = IsMarried, Type = "bool", Phi = false, Mask = false },
            new SqlFieldSelector { Column = IsHispanic, Type = "bool", Phi = false, Mask = false },
            new SqlFieldSelector { Column = IsDeceased, Type = "bool", Phi = false, Mask = false },
            new SqlFieldSelector { Column = BirthDate, Type = "datetime", Phi = true, Mask = true },
            new SqlFieldSelector { Column = DeathDate, Type = "datetime", Phi = true, Mask = true },
            new SqlFieldSelector { Column = Name, Type = "string", Phi = true, Mask = false },
            new SqlFieldSelector { Column = Mrn, Type = "string", Phi = true, Mask = false }
        };

        public static Dictionary<string, string> Types = new Dictionary<string, string>
        {
            {"varchar", "string"},
            {"nvarchar", "string"},
            {"datetime", "datetime"},
            {"date", "datetime"},
            {"bit", "bool"},
            {"int", "int"},
            {"uniqueidentifier", "guid"}
        };
    }
}
