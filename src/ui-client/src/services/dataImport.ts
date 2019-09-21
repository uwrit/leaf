/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import REDCapImportWebWorker, { OutboundMessageResultCount } from "../providers/redcapImport/redcapImportWebWorker";
import { REDCapImportConfiguration, REDCapConcept } from "../models/redcapApi/ImportConfiguration";

const worker = new REDCapImportWebWorker();

export const loadREDCapImportData = async (config: REDCapImportConfiguration): Promise<Map<string, REDCapConcept>> => {
    return new Promise( async (resolve, reject) => {
        const concepts = await worker.loadConfig(config) as Map<string, REDCapConcept>;
        resolve(concepts);
    });
};

export const calculateREDCapFieldCount = async (concept: REDCapConcept): Promise<number> => {
    return new Promise( async (resolve, reject) => {
        const count = await worker.calculatePatientCount(concept) as OutboundMessageResultCount;
        resolve(count.value);
    });
};