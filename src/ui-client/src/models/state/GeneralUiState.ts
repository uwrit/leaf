/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { RouteConfig } from "../../config/routes";

export enum Routes {
    FindPatients = 1,
    Map = 2,
    Visualize = 3,
    PatientList = 4,
    AdminPanel = 5
}

export enum NotificationStates {
    Working = 1,
    Complete = 2,
    Hidden = 3
}

export interface CohortCountBoxState {
    boxVisible: boolean;
    boxMinimized: boolean;
    infoButtonVisible: boolean;
}

export interface InformationModalState {
    body: any;
    header: string;
    onClickOkay?: any;
    show: boolean;
}

export interface ConfirmationModalState {
    body: any;
    header: string;
    onClickNo: any;
    onClickYes: any;
    noButtonText: string;
    yesButtonText: string;
    show: boolean;
}

export interface NoClickModalState {
    message?: string;
    state: NotificationStates;
}

export interface SideNotificationState {
    message?: string;
    state: NotificationStates;
}

export interface GeneralUiState {
    browser?: Browser;
    cohortCountBox: CohortCountBoxState;
    confirmationModal: ConfirmationModalState;
    currentRoute: Routes;
    informationModal: InformationModalState;
    noclickModal: NoClickModalState;
    routes: RouteConfig[];
    showImportMrnModal: boolean;
    showImportRedcapModal: boolean;
    showMyLeafModal: boolean;
    showExportDataModal: boolean;
    showSaveQueryPane: boolean;
    sideNotification: SideNotificationState;
}

export enum BrowserType { 
    Chrome = 1,
    Edge = 2,
    Firefox = 3,
    InternetExplorer = 4,
    Opera = 5,
    Safari = 6,
    Other = 7
}

export interface Browser {
    error?: boolean;
    majorVersion: number;
    type: BrowserType;
    version: string;
}

    