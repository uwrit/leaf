/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { CohortDataMap } from '../models/cohortData/cohortData';
import { PatientListDatasetDTO, PatientListDatasetQueryDTO } from '../models/patientList/Dataset';
import CohortDataWebWorker from '../providers/cohortData/cohortDataWebWorker';

const cohortDataProvider = new CohortDataWebWorker();

export const transform = async (data: [PatientListDatasetQueryDTO, PatientListDatasetDTO]): Promise<CohortDataMap> => {
    const transformed = await cohortDataProvider.transform(data);
    return transformed as CohortDataMap;
};
