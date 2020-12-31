/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { ConceptDatasetDTO } from '../models/cohort/ConceptDataset';
import { Concept } from '../models/concept/Concept';
import { TimelinesConfiguration } from '../models/timelines/Configuration';
import TimelinesWebWorker from '../providers/timelines/timelinesWebWorker';

const timelinesProvider = new TimelinesWebWorker();

/**
 * Return a timeline chart object based on the current configuration
 */
export const getChartData = (config: TimelinesConfiguration) => {
    return timelinesProvider.query(config);
};

/**
 * Add a Concept Dataset
 */
export const addConceptDataset = (dataset: ConceptDatasetDTO, responderId: number, concept: Concept) => {
    return timelinesProvider.addConceptDataset(dataset, responderId, concept);
};

/**
 * Add an Index Dataset
 */
export const addIndexDataset = (dataset: ConceptDatasetDTO, responderId: number) => {
    return timelinesProvider.addIndexDataset(dataset, responderId);
};

/**
 * Remove Dataset
 */
export const removeConceptDataset = (config: TimelinesConfiguration, concept: Concept) => {
    return timelinesProvider.removeConceptDataset(config, concept);
};

/**
 * Clear all data
 */
export const clearAllData = () => {
    return timelinesProvider.clear();
};