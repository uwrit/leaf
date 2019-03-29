/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import Axios from 'axios';
import { AppState } from '../models/state/AppState';
import REDCapEvent from '../models/redcapExport/Event';
import REDCapEventMapping from '../models/redcapExport/EventMapping';
import REDCapFieldMetadata from '../models/redcapExport/Metadata';
import REDCapProjectRequest, { REDCapProjectPurpose } from '../models/redcapExport/Project';
import REDCapRepeatingFormEvent from '../models/redcapExport/RepeatingFormEvent';
import REDCapUser from '../models/redcapExport/User';
import { HttpFactory } from './HttpFactory';

enum ContentTypes {
    EventMappings = 'formEventMapping',
    Events = 'event',
    Metadata = 'metadata',
    Project = 'project',
    Records = 'record',
    RepeatingFormsEvents = 'repeatingFormsEvents',
    Users = 'user',
    Version = 'version'
}

interface REDCapVersion {
    major: number;
    minor: number;
    patch: number;
}

export const getExportOptions = (state: AppState) => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    return http.get('/api/export/options');
};

export const getREDCapVersion = (state: AppState) => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    return http.get('/api/export/redcap/version');
};

export const requestProjectCreation = (state: AppState, projectName: string, classic: boolean) => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const project: REDCapProjectRequest = {
        is_longitudinal: (classic ? '0' : '1'),
        project_title: projectName,
        purpose: REDCapProjectPurpose.Practice,
        record_autonumbering_enabled: '0'
    };
    return http.post('/api/export/redcap/project/create', project);
};

export class REDCapHttpConnector {
    private token: string = '';
    private endpointUri: string = '';
    private http = Axios.create({
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });

    constructor(token?: string, endpointUri?: string) {
        if (token) { this.token = token; }
        if (endpointUri) { this.endpointUri = endpointUri; }
    }

    /*
     * Configure the API token and REDCap endpoint. Used if
     * they are not known at initialization.
     */
    public configure(token: string, endpointUri: string) {
        this.token = token;
        this.endpointUri = endpointUri;
    }

    /*
     * Get Project Info.
     */
    public getProjectInfo = () => this.request(ContentTypes.Project);

    /*
     * Convenience method for getting the user-facing url for
     * a newly exportted project. This is returned at the
     * end of an export.
     */
    public getProjectUrl = async (version: string) => {
        const project: any = await this.getProjectInfo();
        const parts = [
            `${this.endpointUri.replace('/api/','')}`,
            `redcap_v${version}`,
            `DataEntry`,
            `record_status_dashboard.php?pid=${project.data.project_id}`
        ];
        return parts.join('/');
    }

    /*
     * Export Metadata via derived fields from Leaf Patient List.
     */
    public exportMetadata = (metadata: REDCapFieldMetadata[]) => this.request(ContentTypes.Metadata, metadata);

    /*
     * Export Events. Each instance of row within a dataset for
     * a unique patient becomes an event in REDCap.
     */
    public exportEvents = (events: REDCapEvent[]) => this.request(ContentTypes.Events, events, [ 'action=import', 'override=0' ]);

    /*
     * Export Event Mappings. This links REDCap forms (which each are 
     * derived from Leaf datasets) to each of their respective Events.
     */
    public exportEventMappings = (eventMappings: REDCapEventMapping[]) => this.request(ContentTypes.EventMappings, eventMappings);

    /*
     * Export Users. This is a single object array of the current user,
     * who will be the project owner in REDCap.
     */
    public exportUsers = (users: REDCapUser[]) => this.request(ContentTypes.Users, users);

    /*
     * Export Repeating forms events. This was first allowed in REDCap v8.10.0 (at UW's request).
     * This method is the preferred way of creating and deploying Leaf -> REDCap projects.
     */
    public exportRepeatingFormsEvents = (repeatingForms: REDCapRepeatingFormEvent[]) => this.request(ContentTypes.RepeatingFormsEvents, repeatingForms);

    /*
     * Export records. These are rows from the Patient List.
     */
    public exportRecords = (records: object[]) => this.request(ContentTypes.Records, records, [ 'type=flat', 'overwriteBehavior=normal', 'forceAutoNumber=false' ]);

    /*
     * Send REDCap API request.
     */
    private request = (content: string, data?: any, additionalParams?: any[]): Promise<any> => {
        const payload = this.getPayload(content, data, additionalParams);
        return this.http.post(this.endpointUri, payload.join('&'));
    }

    /*
     * Concatenate JSON data into an API-friendly string.
     */
    private getPayload = (content: string, data?: any, additionalParams?: any[]): string[] => {
        let payload = [
            this.toKeyValue('token', this.token),
            this.toKeyValue('content', content),
            this.toKeyValue('format', 'json'),
        ];
        if (data) {
            payload.push(this.toKeyValue('data', (typeof data === 'string' ? data : JSON.stringify(data))));
        }
        if (additionalParams) {
            payload = payload.concat(additionalParams)
        }
        return payload;
    }

    private toKeyValue = (key: string, value: string): string => `${key}=${value}`;
};


/*
 * Convenience method for checking if given REDCap instance
 * allows for repeatable form declaration via API.
 */
export const repeatableFormsAllowed = (versionStr: string) => {
    const version = versionStringToObject(versionStr);
    const min = minRepeatingFormEventsApiVersion;
    return ( 
        version.major > min.major ||
        (version.major === min.major && version.minor > min.minor) ||
        (version.major === min.major && version.minor === min.minor && version.patch >= min.patch)
    );
};

const versionStringToObject = (vStr: string): REDCapVersion => {
    const split = vStr.split('.');
    return {
        major: +split[0],
        minor: +split[1],
        patch: +split[2]
    };
};

const minRepeatingFormEventsApiVersion: REDCapVersion = {
    major: 8,
    minor: 10,
    patch: 0
};
