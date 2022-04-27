/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { CohortData } from '../models/state/CohortState';
import { DemographicRow } from '../models/cohortData/DemographicDTO';
import { PatientListDatasetDTO, PatientListDatasetQueryDTO } from '../models/patientList/Dataset';
import CohortDataWebWorker from '../providers/cohortData/cohortDataWebWorker';
import { WidgetTimelineComparisonEntryConfig } from '../models/config/content';

const cohortDataProvider = new CohortDataWebWorker();

export const transform = async (
        datasets: [PatientListDatasetQueryDTO, PatientListDatasetDTO], 
        demographics: DemographicRow[])
    : Promise<CohortData> => {
    const transformed = await cohortDataProvider.transform(datasets, demographics);
    return transformed as CohortData;
};

export const getComparisonMeans = async (
    dimensions: WidgetTimelineComparisonEntryConfig[], sourcePatId: string) 
    : Promise<Map<string, Map<string, number>>> => {
    const means = await cohortDataProvider.getCohortMean(dimensions, sourcePatId);
    return means as Map<string, Map<string, number>>;
};
