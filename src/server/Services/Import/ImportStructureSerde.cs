// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Newtonsoft.Json;
using Model.Import;

namespace Services.Import
{
    public static class ImportStructureSerde
    {
        public static IImportStructure Deserialize(ImportType type, string json)
        {
            if (json == null)
            {
                return null;
            }

            switch (type)
            {
                case ImportType.MRN:
                    return JsonConvert.DeserializeObject<MrnImportStructure>(json);
                case ImportType.REDCapProject:
                    return JsonConvert.DeserializeObject<REDCapImportStructure>(json);
                default:
                    return null;
            }
        }

        public static string Serialize(ImportType type, IImportStructure structure)
        {
            if (structure == null)
            {
                return null;
            }

            return JsonConvert.SerializeObject(structure);
        }
    }
}