/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
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

export interface REDCapImportConfiguration {
    eventMappings?: REDCapEventMapping[];
    events?: REDCapEvent[];
    forms: REDCapForm[];
    metadata: REDCapFieldMetadata[];
    mrnField: string;
    mrns: REDCapRecord[];
    projectInfo: REDCapProjectInfo;
    recordField: string;
    records: REDCapEavRecord[];
    users: REDCapUser[];
}