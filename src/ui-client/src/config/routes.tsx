/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react'
import { FiBarChart2, FiMap, FiSearch } from 'react-icons/fi';
import { MdPerson } from 'react-icons/md'
import { FindPatients } from '../components/FindPatients/FindPatients';
import LeafMap from '../containers/Map/LeafMap';
import PatientList from '../containers/PatientList/PatientList';
import Visualize from '../containers/Visualize/Visualize';
import { Routes } from '../models/state/GeneralUiState';
import { UserContext, AuthConfig } from '../models/Auth';
import { MdSecurity } from 'react-icons/md';
import AdminPanel from '../containers/Admin/AdminPanel';
import AdminState, { AdminPanelPane } from '../models/state/AdminState';
import { ConceptEditor } from '../components/Admin/ConceptEditor/ConceptEditor';
import { setAdminPanelSubPane, setAdminPanelPane } from '../actions/admin/admin';

export interface RouteConfig {
    display: string;
    icon: any;
    index: Routes;
    path: string;
    render: any;
    subRoutes?: SubRouteConfig[];
}

interface SubRouteConfig {
    clickHandler: any;
    display: string;
}

const findPatients = (): RouteConfig => {
    return {   
        display: 'Find Patients', 
        icon: <FiSearch />,
        index: Routes.FindPatients,
        path: '/', 
        render: () => <FindPatients />
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
const patientList = (): RouteConfig => { 
    return {
        display: 'Patient List', 
        icon: <MdPerson />,
        index: Routes.PatientList,
        path: '/patientList', 
        render: () => <PatientList /> 
    };
};
const admin = (): RouteConfig => {
    return {
        display: 'Admin',
        icon: <MdSecurity />,
        index: Routes.AdminPanel,
        path: '/admin',
        render: () => <AdminPanel />,
        subRoutes: [{
            clickHandler: (dispatch: any) => dispatch(setAdminPanelPane(AdminPanelPane.CONCEPTS)),
            display: 'Concepts',
        }, {
            clickHandler: (dispatch: any) => dispatch(setAdminPanelPane(AdminPanelPane.DATASETS)),
            display: 'Datasets',
        }, {
            clickHandler: (dispatch: any) => dispatch(setAdminPanelPane(AdminPanelPane.NETWORK)),
            display: 'Network and Identity',
        }]
    };
}

export const getRoutes = (config: AuthConfig, userContext: UserContext): RouteConfig[] => {
    const routes = [ findPatients(), visualize(), patientList() ];
    if (config!.clientOptions.map.enabled) {
        routes.splice(1, 0, map(config!.clientOptions.map.tileURI));
    }
    if (userContext && userContext.isAdmin) {
        routes.push(admin());
    }
    return routes;
};
