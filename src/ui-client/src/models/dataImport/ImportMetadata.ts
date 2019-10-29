/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Concept } from "../concept/Concept";
import { BaseREDCapImportConfiguration } from "../redcapApi/ImportConfiguration";
import { Constraint } from "../admin/Concept";

export enum ImportType {
    REDCapProject = 1,
    MRN = 2
}

interface BaseImportMetadata {
    constraints: Constraint[];
    created: Date;
    id?: string;
    sourceId: string;
    type: ImportType;
    updated: Date;
}

export interface ImportMetadata extends BaseImportMetadata {
    structure: ImportStructure;
}

export interface ImportMetadataDTO extends BaseImportMetadata {
    structureJson: string;
}

export interface ImportStructure {
    id: string;
}

export interface REDCapImportStructure extends ImportStructure {
    concepts: Concept[];
    configuration: BaseREDCapImportConfiguration;
    patients: number;
}

export interface MrnImportStructure extends ImportStructure {
    name: string;
    category: string;
}