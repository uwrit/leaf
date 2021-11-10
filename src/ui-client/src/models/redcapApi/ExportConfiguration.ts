/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { REDCapEvent } from './Event';
import { REDCapEventMapping } from './EventMapping';
import { REDCapFieldMetadata } from './Metadata';
import { REDCapProjectRequestInfo } from './Project';
import { REDCapRepeatingFormEvent } from './RepeatingFormEvent';
import { REDCapUser } from './User';

export interface REDCapProjectExportConfiguration {
    data: object[];
    events?: REDCapEvent[];
    eventMappings?: REDCapEventMapping[];
    metadata: REDCapFieldMetadata[];
    repeatingFormEvents?: REDCapRepeatingFormEvent[];
    users: REDCapUser[];
    project: REDCapProjectRequestInfo;
}
