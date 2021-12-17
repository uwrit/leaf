/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import Axios from 'axios';
import { AppState } from '../models/state/AppState';
import { REDCapEvent } from '../models/redcapApi/Event';
import { REDCapEventMapping } from '../models/redcapApi/EventMapping';
import { REDCapFieldMetadata } from '../models/redcapApi/Metadata';
import { REDCapRepeatingFormEvent } from '../models/redcapApi/RepeatingFormEvent';
import { REDCapUser } from '../models/redcapApi/User';
import { REDCapProjectRequestInfo, REDCapProjectPurpose, REDCapProjectInfo } from '../models/redcapApi/Project';
import { HttpFactory } from './HttpFactory';
import { REDCapRecord, REDCapEavRecord } from '../models/redcapApi/Record';
import { REDCapArm } from '../models/redcapApi/Arm';
import { REDCapForm } from '../models/redcapApi/Form';
import { REDCapRecordExportConfiguration } from '../models/redcapApi/RecordExportConfiguration';

export enum REDCapContentTypes {
    Arms = 'arm',
    EventMappings = 'formEventMapping',
    Events = 'event',
    Forms = 'instrument',
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

export const getImportOptions = (state: AppState) => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    return http.get('/api/import/options');
};

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
    const project: REDCapProjectRequestInfo = {
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
     * Get project info. 
     */
    public getProjectInfo = async (): Promise<REDCapProjectInfo> => {
        const req = await this.request(REDCapContentTypes.Project);
        return req.data as REDCapProjectInfo;
    };

    /*
     * Get project metadata. 
     */
    public getMetadata = async (): Promise<REDCapFieldMetadata[]> => {
        const req = await this.request(REDCapContentTypes.Metadata);
        return req.data as REDCapFieldMetadata[];
    };

    /*
     * Get project forms. 
     */
    public getForms = async (): Promise<REDCapForm[]> => {
        const req = await this.request(REDCapContentTypes.Forms);
        return req.data as REDCapForm[];
    };

    /*
     * Get project arms. 
     */
    public getArms = async (): Promise<REDCapArm[]> => {
        const req = await this.request(REDCapContentTypes.Arms);
        return req.data as REDCapArm[];
    };

    /*
     * Get project events. 
     */
    public getEvents = async (): Promise<REDCapEvent[]> => {
        const req = await this.request(REDCapContentTypes.Events);
        return req.data as REDCapEvent[];
    };

    /*
     * Get project events. 
     */
    public getEventMappings = async (): Promise<REDCapEventMapping[]> => {
        const req = await this.request(REDCapContentTypes.EventMappings);
        return req.data as REDCapEventMapping[];
    };

    /*
     * Get project repeating forms. 
     */
    public getRepeatingForms = async (): Promise<REDCapRepeatingFormEvent[]> => {
        const req = await this.request(REDCapContentTypes.RepeatingFormsEvents);
        return req.data as REDCapRepeatingFormEvent[];
    };

    /*
     * Get project users. 
     */
    public getUsers = async (): Promise<REDCapUser[]> => {
        const req = await this.request(REDCapContentTypes.Users);
        return req.data as REDCapUser[];
    };

    /*
     * Get project records. 
     */
    public getRecords = async (config?: REDCapRecordExportConfiguration): Promise<REDCapRecord[] | REDCapEavRecord[]> => {
        let params: string[] = [];
        if (config) {
            if (config.type) {
                params.push( `type=${config.type}` );
            }
            if (config.fields) {
                params.push( `fields=${config.fields.join(',')}` );
            }
            if (config.events) {
                params.push( `events=${config.events.join(',')}` );
            }
            if (config.forms) {
                params.push( `forms=${config.forms.join(',')}` );
            }
            if (config.records) {
                params.push( `records=${config.records.join(',')}` );
            }
        }

        const req = await this.request(REDCapContentTypes.Records, null, params);
        return req.data;
    };

    /*
     * Convenience method for getting the user-facing url for
     * a newly exported project. This is returned at the end of an export.
     */
    public getProjectUrl = async (version: string) => {
        const project: REDCapProjectInfo = await this.getProjectInfo();
        const parts = [
            `${this.endpointUri.replace('/api/','')}`,
            `redcap_v${version}`,
            `DataEntry`,
            `record_status_dashboard.php?pid=${project.project_id}`
        ];
        return parts.join('/');
    }

    /*
     * Export Metadata via derived fields from Leaf Patient List.
     */
    public exportMetadata = (metadata: REDCapFieldMetadata[]) => this.request(REDCapContentTypes.Metadata, metadata);

    /*
     * Export Events. Each instance of row within a dataset for
     * a unique patient becomes an event in REDCap.
     */
    public exportEvents = (events: REDCapEvent[]) => this.request(REDCapContentTypes.Events, events, [ 'action=import', 'override=0' ]);

    /*
     * Export Event Mappings. This links REDCap forms (which each are 
     * derived from Leaf datasets) to each of their respective Events.
     */
    public exportEventMappings = (eventMappings: REDCapEventMapping[]) => this.request(REDCapContentTypes.EventMappings, eventMappings);

    /*
     * Export Users. This is a single object array of the current user,
     * who will be the project owner in REDCap.
     */
    public exportUsers = (users: REDCapUser[]) => this.request(REDCapContentTypes.Users, users);

    /*
     * Export Repeating forms events. This was first allowed in REDCap v8.10.0 (at UW's request).
     * This method is the preferred way of creating and deploying Leaf -> REDCap projects.
     */
    public exportRepeatingFormsEvents = (repeatingForms: REDCapRepeatingFormEvent[]) => this.request(REDCapContentTypes.RepeatingFormsEvents, repeatingForms);

    /*
     * Export records. These are rows from the Patient List.
     */
    public exportRecords = (records: object[]) => this.request(REDCapContentTypes.Records, records, [ 'type=flat', 'overwriteBehavior=normal', 'forceAutoNumber=false' ]);

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
