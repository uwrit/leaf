/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { REDCapEventMapping } from "./EventMapping";
import { REDCapEvent } from "./Event";
import { REDCapForm } from "./Form";
import { REDCapFieldMetadata } from "./Metadata";
import { REDCapRecord, REDCapEavRecord } from "./Record";
import { REDCapProjectInfo } from "./Project";
import { REDCapUser } from "./User";
import { Concept } from "../concept/Concept";

export interface BaseREDCapImportConfiguration {
    eventMappings?: REDCapEventMapping[];
    events?: REDCapEvent[];
    forms: REDCapForm[];
    mrnField: string;
    projectInfo: REDCapProjectInfo;
    recordField: string;
    users: REDCapUser[];
}

export interface REDCapImportConfiguration extends BaseREDCapImportConfiguration {
    metadata: REDCapFieldMetadata[];
    mrns: REDCapRecord[];
    records: REDCapEavRecord[];
}

export interface REDCapUrn {
    event?: string;
    field?: string;
    form?: string;
    instance?: number;
    project: number;
    value?: number;
}

export interface REDCapConcept extends Concept {
    urn: REDCapUrn;
}