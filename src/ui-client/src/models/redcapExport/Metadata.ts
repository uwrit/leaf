/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

export default interface REDCapFieldMetadata {
    branching_logic: string;
    custom_alignment: string;
    field_annotation: string;
    field_label: string;
    field_name: string;
    field_note: string;
    field_type: string;
    form_name: string;
    identifier: string;
    matrix_group_name: string;
    matrix_ranking: string;
    question_number: string;
    required_field: string;
    section_header: string;
    select_choices_or_calculations: string;
    text_validation_max: string;
    text_validation_min: string;
    text_validation_type_or_show_slider_number: string;
}