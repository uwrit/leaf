/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { REDCapImportConfiguration } from "../redcapApi/ImportConfiguration";

export interface REDCapImportOptionsDTO {
    apiURI?: string;
    enabled: boolean;
}

export interface REDCapImportState extends REDCapImportOptionsDTO {
    apiToken?: string;
    config?: REDCapImportConfiguration;
    metadataLoaded: false;
    mrnField?: string;
    patients: number;
    rows: number;
    unmatchedPatients: string[];
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
    isComplete: boolean;
    isErrored: boolean;
    isImporting: boolean;
    mrn: MrnImportOptions;
    progress: ImportProgress;
    redCap: REDCapImportState;
}
