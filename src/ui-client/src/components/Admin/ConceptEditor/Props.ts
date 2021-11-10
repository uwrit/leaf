/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { Concept as AdminConcept } from "../../../models/admin/Concept";
import { Concept as UserConcept } from "../../../models/concept/Concept";
import { ConceptSqlSet } from "../../../models/admin/Concept";
import { SqlConfiguration } from "../../../models/admin/Configuration";
import AdminState from "../../../models/state/AdminState";

export interface EditorPaneProps { 
    data: AdminState;
    dispatch: any;
    toggleSqlPreview: (show: boolean) => any;
    togglePanelPreview: (show: boolean) => any;
    toggleOverlay: (show: boolean) => any;
}

export interface SectionProps {
    adminConcept?: AdminConcept;
    userConcept?: UserConcept;
    changed: boolean;
    changeHandler: (val: any, propName: string) => any;
    dispatch: any;
    forceValidation: boolean;
    sqlSets: Map<number, ConceptSqlSet>;
    sqlConfig: SqlConfiguration;
    toggleSqlPreview: (show: boolean) => any;
    togglePanelPreview: (show: boolean) => any;
    toggleOverlay: (show: boolean) => any;
}

export interface PropertyProps {
    changeHandler: (val: any, propName: string) => any;
    className?: string;
    errorText?: string;
    label?: string;
    locked?: boolean;
    forceValidation?: boolean;
    focusToggle?: (show: boolean) => void;
    onClick?: (e: React.MouseEvent<HTMLElement>) => any;
    placeholder?: string;
    propName: string;
    required?: boolean;
    subLabel?: string;
    type?: 'text' | 'number';
    value?: any;
}