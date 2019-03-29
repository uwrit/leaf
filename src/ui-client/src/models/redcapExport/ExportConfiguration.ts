/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import REDCapEvent from './Event';
import REDCapEventMapping from './EventMapping';
import REDCapFieldMetadata from './Metadata';
import REDCapProject from './Project';
import REDCapRepeatingFormEvent from './RepeatingFormEvent';
import REDCapProjectUser from './User';

export default interface REDCapProjectExportConfiguration {
    data: object[];
    events?: REDCapEvent[];
    eventMappings?: REDCapEventMapping[];
    metadata: REDCapFieldMetadata[];
    repeatingFormEvents?: REDCapRepeatingFormEvent[];
    users: REDCapProjectUser[];
    project: REDCapProject;
}
