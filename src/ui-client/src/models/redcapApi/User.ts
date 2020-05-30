/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

export interface REDCapUser {
    api_export: number;
    api_import: number;
    calendar: number;
    data_access_group: string;
    data_access_group_id: string;
    data_access_groups: number;
    data_comparison_tool: number;
    data_export: number;
    data_import_tool: number;
    data_quality_create: number;
    data_quality_execute: number;
    design: number;
    email: string;
    expiration: string;
    file_repository: number;
    firstname: string;
    forms: object;
    lastname: string;
    lock_records: number;
    lock_records_all_forms: number;
    lock_records_customization: number;
    logging: number;
    manage_survey_participants: number;
    mobile_app: number;
    mobile_app_download_data: number;
    record_create: number;
    record_delete: number;
    record_rename: number;
    reports: number;
    stats_and_charts: number;
    username: string;
    user_rights: number;
}