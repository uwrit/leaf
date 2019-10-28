/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import REDCapImportWebWorker, { OutboundMessageResultCount } from "../providers/redcapImport/redcapImportWebWorker";
import { REDCapImportConfiguration, REDCapConcept } from "../models/redcapApi/ImportConfiguration";
import { HttpFactory } from './HttpFactory';
import { AppState } from "../models/state/AppState";
import { ImportMetadata, ImportMetadataDTO } from "../models/dataImport/ImportMetadata";
import { ImportRecord, ImportDataResultDTO, ImportRecordDTO } from "../models/dataImport/ImportRecord";

const worker = new REDCapImportWebWorker();

/*
 * Given an import configuration, requests and returns REDCapConcepts from
 * the data import web worker.
 */
export const loadREDCapImportData = async (config: REDCapImportConfiguration): Promise<REDCapConcept[]> => {
    return new Promise( async (resolve, reject) => {
        const concepts = await worker.loadConfig(config) as REDCapConcept[];
        resolve(concepts);
    });
};

/*
 * Given a REDCap Concept, requests and returns a count of unique patients.
 */
export const calculateREDCapFieldCount = async (concept: REDCapConcept): Promise<number> => {
    return new Promise( async (resolve, reject) => {
        const count = await worker.calculatePatientCount(concept) as OutboundMessageResultCount;
        resolve(count.value);
    });
};

/*
 * Clear all current cached import data.
 */
export const clearRecords = async () => {
    return new Promise( async (resolve, reject) => {
        await worker.clearRecords();
        resolve();
    });
};

/*
 * Clear records with unmapped MRNs.
 */
export const clearUnmappedRecords = async (unmapped: Set<string>) => {
    return new Promise( async (resolve, reject) => {
        await worker.clearUnmapped(unmapped);
        resolve();
    });
};

/*
 * Get all currently prepped REDCapImport records
 */
export const getREDCapImportRecords = async (importMetadataId: string): Promise<ImportRecordDTO[]> => {
    return new Promise( async (resolve, reject) => {
        const records = await worker.getRecords(importMetadataId) as ImportRecordDTO[];
        resolve(records);
    });
};

/*
 * Get all metadata imports.
 */
export const getAllMetdata = async (state: AppState): Promise<ImportMetadata[]> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.get('api/import/metadata');
    const dtos = resp.data as ImportMetadataDTO[];
    return dtos.map(dto => fromDto(dto));
};

/*
 * Get import metadata by id.
 */
export const getMetdataById = async (state: AppState, id: string): Promise<ImportMetadata> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.get(`api/import/metadata/${id}`);
    const dto = resp.data as ImportMetadataDTO;
    return fromDto(dto);
};

/*
 * Get import metadata by source id.
 */
export const getMetdataBySourceId = async (state: AppState, sourceId: string): Promise<ImportMetadata> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const request = await http.get(`api/import/metadata/${sourceId}`);
    const dto = request.data as ImportMetadataDTO;
    return fromDto(dto);
};

/*
 * Create import metadata.
 */
export const createMetadata = async (state: AppState, meta: ImportMetadata): Promise<ImportMetadata> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.post(`api/import/metadata`, toDto(meta));
    const dto = resp.data as ImportMetadataDTO;
    return fromDto(dto);
};

/*
 * Update import metadata.
 */
export const updateMetadata = async (state: AppState, meta: ImportMetadata): Promise<ImportMetadata> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.put(`api/import/metadata`, toDto(meta));
    const dto = resp.data as ImportMetadataDTO;
    return fromDto(dto);
};

/*
 * Delete import metadata.
 */
export const deleteMetadata = async (state: AppState, meta: ImportMetadata): Promise<ImportMetadata> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.delete(`api/import/metadata/${meta.id}`);
    const dto = resp.data as ImportMetadataDTO;
    return fromDto(dto);
};

/*
 * Upsert import data.
 */
export const upsertImportRecords = async (state: AppState, meta: ImportMetadata, records: ImportRecordDTO[]): Promise<ImportDataResultDTO> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.post(`api/import/data/${meta.id}`, {
        records
    });
    const result = resp.data as ImportDataResultDTO;
    return result;
};

const fromDto = (dto: ImportMetadataDTO): ImportMetadata => {
    return {
        id: dto.id,
        constraints: dto.constraints,
        sourceId: dto.sourceId,
        structure: JSON.parse(dto.structureJson),
        type: dto.type
    };
};

const toDto = (meta: ImportMetadata): ImportMetadataDTO => {
    return {
        id: meta.id,
        constraints: meta.constraints,
        sourceId: meta.sourceId,
        structureJson: JSON.stringify(meta.structure),
        type: meta.type
    };
};