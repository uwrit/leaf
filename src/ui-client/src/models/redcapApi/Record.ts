/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

export interface REDCapRecord {
    redcap_event_name?: string;
    redcap_repeat_instance?: string;
    redcap_repeat_instrument?: string;
}

export interface REDCapEavRecord extends REDCapRecord {
    record: string;
    field_name: string;
    value: string;
}