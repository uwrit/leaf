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
    const resp = await http.put(`api/admin/specializationgroup/${grp.id}`, grp);
    return fromDTO(resp.data);
};

/*
 * Creates a new Concept SpecializationGroup.
 */ 
export const createSpecializationGroup = async (state: AppState, grp: SpecializationGroup): Promise<SpecializationGroup> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.post(`api/admin/specializationgroup`, grp);
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

const fromDTO = (dto: SpecializationGroupDTO): SpecializationGroup => {
    const map: Map<string,Specialization> = new Map();
    dto.specializations.forEach((s) => map.set(s.id, s));
    return { ...dto, specializations: map };
};