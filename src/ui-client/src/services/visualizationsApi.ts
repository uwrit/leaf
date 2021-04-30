/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { AppState } from '../models/state/AppState';
import { VisualizationPageDTO } from '../models/visualization/Visualization';
import { HttpFactory } from './HttpFactory';

/**
 * Add a Concept Dataset
 */
export const getVisualizations = (state: AppState): Promise<VisualizationPageDTO> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    return http.get("/api/visualization") as Promise<VisualizationPageDTO>;
};
