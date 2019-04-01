/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { AppState } from '../../models/state/AppState';
import { HttpFactory } from './../HttpFactory';
import { SpecializationGroup, SpecializationGroupDTO, Specialization } from '../../models/admin/Concept';

/*
 * Gets all current Concept SpecializationGroups.
 */ 
export const getSpecializationGroups = async (state: AppState): Promise<SpecializationGroup[]> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.get('api/admin/specializationgroup');
    const grpDto = resp.data as SpecializationGroupDTO[];
    const grps: SpecializationGroup[] = [];
    for (const grp of grpDto) {
        grps.push(fromDTO(grp));
    }
    return grps;
};

/*
 * Updates an existing Concept SpecializationGroup.
 */ 
export const updateSpecializationGroup = async (state: AppState, grp: SpecializationGroup): Promise<SpecializationGroup> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.put(`api/admin/specializationgroup/${grp.id}`, toDTO(grp));

    // Updates don't actually change the Specialization children,
    // so just use the originals
    const newGrp = fromDTO(resp.data) as SpecializationGroup;
    newGrp.specializations = grp.specializations
    return newGrp;
};

/*
 * Creates a new Concept SpecializationGroup.
 */ 
export const createSpecializationGroup = async (state: AppState, grp: SpecializationGroup): Promise<SpecializationGroup> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.post(`api/admin/specializationgroup`, toDTO(grp));
    return fromDTO(resp.data);
};

/*
 * Deletes an existing Concept SpecializationGroup.
 */ 
export const deleteSpecializationGroup = async (state: AppState, grp: SpecializationGroup) => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    return http.delete(`api/admin/specializationgroup/${grp.id}`);
};

/*
 * Turns a normal Specialization Group into a DTO.
 */ 
const fromDTO = (dto: SpecializationGroupDTO): SpecializationGroup => {
    const map: Map<string,Specialization> = new Map();
    dto.specializations.forEach((s) => {
        s.sqlSetId = dto.sqlSetId;
        map.set(s.id, s);
    });
    return { 
        ...dto, 
        changed: false,
        unsaved: false,
        specializations: map 
    };
};

/*
 * Turns a DTO into a normal Specialization Group.
 */ 
const toDTO = (grp: SpecializationGroup): SpecializationGroupDTO => {
    const dto: SpecializationGroupDTO = {
        id: grp.id,
        sqlSetId: grp.sqlSetId,
        specializations: [],
        uiDefaultText: grp.uiDefaultText
    };
    grp.specializations.forEach((s) => {
        const spc: any = {
            id: null,
            orderId: s.orderId,
            sqlSetWhere: s.sqlSetWhere,
            specializationGroupId: s.specializationGroupId,
            uiDisplayText: s.uiDisplayText,
            universalId: s.universalId
        };
        dto.specializations.push(spc)
    });
    return dto;
};