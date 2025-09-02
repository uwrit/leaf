/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React, { Suspense } from 'react'
import { FiBarChart2, FiMap, FiSearch, FiSliders } from 'react-icons/fi';
import { MdPerson } from 'react-icons/md'
import { FindPatients } from '../components/FindPatients/FindPatients';
import LeafMap from '../containers/Map/LeafMap';
import PatientList from '../containers/PatientList/PatientList';
import Visualize from '../containers/Visualize/Visualize';
import { Routes } from '../models/state/GeneralUiState';
import { UserContext, AppConfig } from '../models/Auth';
import { MdSecurity } from 'react-icons/md';
import { AdminPanelPane } from '../models/state/AdminState';
import { checkIfAdminPanelUnsavedAndSetPane } from '../actions/admin/admin';
import Timelines from '../containers/Timelines/Timelines';

export interface RouteConfig {
    display: string;
    icon: any;
    index: Routes;
    isBeta?: boolean;
    path: string;
    render: any;
    subRoutes?: SubRouteConfig[];
}

interface SubRouteConfig {
    clickHandler: any;
    display: string;
}

const findPatients = (allowEmptyConcepts: boolean): RouteConfig => {
    return {   
        display: 'Find Patients', 
        icon: <FiSearch />,
        index: Routes.FindPatients,
        path: '/', 
        render: () => <FindPatients allowEmptyConcepts={allowEmptyConcepts} />
    };
};
const map = (tileUri: string): RouteConfig => {
    return {
        display: 'Map',  
        icon: <FiMap />,
        index: Routes.Map,
        path: '/map',
        render: () => (
            <div id="map-container">
                <LeafMap tileUrl={tileUri} /> 
            </div>  
        )
    };
};
const visualize = (): RouteConfig => { 
    return {
        display: 'Visualize', 
        icon: <FiBarChart2 />,
        index: Routes.Visualize,
        path: '/visualize', 
        render: () => <Visualize />
    };
};
const timelines = (allowEmptyConcepts: boolean): RouteConfig => {
    return {
        display: 'Timelines',
        icon: <FiSliders />,
        index: Routes.Timelines,
        path: '/timelines',
        render: () => <Timelines allowEmptyConcepts={allowEmptyConcepts} />
    };
};
const patientList = (allowEmptyConcepts: boolean): RouteConfig => { 
    return {
        display: 'Patient List', 
        icon: <MdPerson />,
        index: Routes.PatientList,
        path: '/patientList', 
        render: () => <PatientList allowEmptyConcepts={allowEmptyConcepts} /> 
    };
};

/*
 * Lazy-load admin panel, as most users will never see it
 */
const AdminPanel = React.lazy(() => import('../containers/Admin/AdminPanel'));
const admin = (allowEmptyConcepts: boolean): RouteConfig => {
    return {
        display: 'Admin',
        icon: <MdSecurity />,
        index: Routes.AdminPanel,
        path: '/admin',
        render: () => (
            <Suspense fallback={null}>
                <AdminPanel allowEmptyConcepts={allowEmptyConcepts} />
            </Suspense>
        ),
        subRoutes: [{
            clickHandler: (dispatch: any) => dispatch(checkIfAdminPanelUnsavedAndSetPane(AdminPanelPane.CONCEPTS)),
            display: 'Concepts',
        }, {
            clickHandler: (dispatch: any) => dispatch(checkIfAdminPanelUnsavedAndSetPane(AdminPanelPane.SQL_SETS)),
            display: 'Concept SQL Sets',
        }, {
            clickHandler: (dispatch: any) => dispatch(checkIfAdminPanelUnsavedAndSetPane(AdminPanelPane.PANEL_FILTERS)),
            display: 'Panel Filters',
        }, {
            clickHandler: (dispatch: any) => dispatch(checkIfAdminPanelUnsavedAndSetPane(AdminPanelPane.GLOBAL_PANEL_FILTERS)),
            display: 'Global Panel Filters',
        }, {
            clickHandler: (dispatch: any) => dispatch(checkIfAdminPanelUnsavedAndSetPane(AdminPanelPane.DATASETS)),
            display: 'Datasets',
        }, {
            clickHandler: (dispatch: any) => dispatch(checkIfAdminPanelUnsavedAndSetPane(AdminPanelPane.NETWORK)),
            display: 'Network and Identity',
        }]
    };
}

export const getRoutes = (config: AppConfig, userContext: UserContext): RouteConfig[] => {
    const client = config!.client;
    const allowEmptyConcepts = config!.client.findPatients.allowEmptyConcepts;
    const routes = [ findPatients(allowEmptyConcepts) ];

    if (client.map.enabled)         { routes.push(map(client.map.tileURI)); }
    if (client.visualize.enabled)   { routes.push(visualize()); }
    if (client.timelines.enabled)   { routes.push(timelines(allowEmptyConcepts)); }
    if (client.patientList.enabled) { routes.push(patientList(allowEmptyConcepts)); }
    if (userContext && userContext.isAdmin) { routes.push(admin(allowEmptyConcepts)); }

    return routes;
};
