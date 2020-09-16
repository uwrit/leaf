/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

export interface CSVExportOptionsDTO {
    enabled: boolean;
}

export interface CSVExportOptions extends CSVExportOptionsDTO {}

export interface REDCapExportOptionsDTO {
    apiURI?: string;
    batchSize?: number;
    enabled: boolean;
    rowLimit?: number;
    scope?: string;
    includeScopeInUsername?: boolean;
}

export interface REDCapExportOptions extends REDCapExportOptionsDTO {
    url?: string;
}

export interface ExportProgress {
    completed: number;
    estimatedSecondsRemaining?: number;
    text?: string;
}

export interface ExportOptionsDTO {
    csv: CSVExportOptions;
    redCap: REDCapExportOptions;
}

export default interface ExportState {
    isComplete: boolean;
    isErrored: boolean;
    isExporting: boolean;
    progress: ExportProgress;
    csv: CSVExportOptions;
    redCap: REDCapExportOptions;
}
