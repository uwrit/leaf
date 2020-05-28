/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { AppState } from '../../models/state/AppState';
import { HttpFactory } from './../HttpFactory';
import { Specialization, SpecializationDTO } from '../../models/admin/Concept';

/*
 * Updates an existing Concept Specialization.
 */ 
export const updateSpecialization = async (state: AppState, spc: Specialization): Promise<Specialization> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.put(`api/admin/specialization/${spc.id}`, spc);
    const updatedSpc = resp.data as SpecializationDTO;
    return { 
        ...updatedSpc, 
        changed: false, 
        unsaved: false, 
        sqlSetId: spc.sqlSetId 
    } as Specialization;
};

/*
 * Creates a new Concept Specialization.
 */ 
export const createSpecialization = async (state: AppState, spc: Specialization): Promise<Specialization> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.post(`api/admin/specialization`, {
        ...spc,
        id: null
    });
    const newSpc = resp.data as SpecializationDTO;
    return { 
        ...newSpc, 
        changed: false,
        unsaved: false,
        sqlSetId: spc.sqlSetId 
    } as Specialization;
};

/*
 * Deletes an existing Concept Specialization.
 */ 
export const deleteSpecialization = async (state: AppState, spc: Specialization) => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    return http.delete(`api/admin/specialization/${spc.id}`);
};
