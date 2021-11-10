/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { REDCapImportConfiguration } from "../redcapApi/ImportConfiguration";
import { ImportMetadata } from "../dataImport/ImportMetadata";

export interface REDCapImportOptionsDTO {
    apiURI: string;
    batchSize: number;
    enabled: boolean;
}

export interface REDCapImportState extends REDCapImportOptionsDTO {
    apiToken?: string;
    summary: REDCapImportCompletionSummary;
    config?: REDCapImportConfiguration;
    mrnField?: string;
    patients: number;
    rows: number;
}

export interface REDCapImportCompletionSummary {
    importedPatients: number;
    importedRows: number;
    unmappedPatients: string[];
    users: string[];
}

export interface ImportProgress {
    completed: number;
    estimatedSecondsRemaining?: number;
    text?: string;
}

export interface MrnImportOptionsDTO {
    enabled: boolean;
}

export interface MrnImportOptions extends MrnImportOptionsDTO { }

export interface ImportOptionsDTO {
    mrn: MrnImportOptionsDTO;
    redCap: REDCapImportOptionsDTO;
}

export default interface ImportState {
    enabled: boolean;
    loaded: boolean;
    imports: Map<string, ImportMetadata>;
    isComplete: boolean;
    isErrored: boolean;
    isImporting: boolean;
    mrn: MrnImportOptions;
    progress: ImportProgress;
    redCap: REDCapImportState;
}
