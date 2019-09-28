// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Threading.Tasks;


namespace Model.Import
{
    public interface IImportService
    {
        Task<ImportMetadata> GetImportAsync(string sourceId);
        Task<ImportMetadata> CreateImportAsync(IImportMetadata import);
        Task<ImportMetadata> UpdateImportAsync(IImportMetadata import);
        Task<ImportMetadata> DeleteImportAsync(Guid id);
    }
}
