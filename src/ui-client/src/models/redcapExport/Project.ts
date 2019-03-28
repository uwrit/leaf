/* Copyright (c) 2019, UW Medicine Research IT
 * Developed by Nic Dobbins and Cliff Spital
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

export default interface REDCapProjectRequest {
    is_longitudinal: string;
    project_title: string;
    purpose?: REDCapProjectPurpose;
    purpose_other?: string;
    project_notes?: string;
    record_autonumbering_enabled: string;
    surveys_enabled?: string;
}

export enum REDCapProjectPurpose {
    Practice = '0',
    Other = '1',
    Research = '2',
    QualityImprovement = '3',
    OperationSupport = '4'
}