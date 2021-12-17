/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 
export interface REDCapProjectInfo {
    creation_time: string;
    custom_record_label?: string;
    display_today_now_button: number;
    has_repeating_instruments_or_events: number;
    is_longitudinal: number;
    production_time?: string;
    project_grant_number?: string;
    project_id: number;
    project_pi_firstname?: string;
    project_pi_lastname?: string;
    project_title: string;
    purpose: number;
    purpose_other?: string;
    project_notes?: string;
    randomization_enabled: number;
    record_autonumbering_enabled: number;
    scheduling_enabled: number;
    secondary_unique_field?: string;
    surveys_enabled: number;
}

export interface REDCapProjectRequestInfo {
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