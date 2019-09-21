/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import REDCapImportWebWorker, { OutboundMessageResultCount } from "../providers/redcapImport/redcapImportWebWorker";
import { REDCapImportConfiguration } from "../models/redcapApi/ImportConfiguration";
import { Concept } from "../models/concept/Concept";

const worker = new REDCapImportWebWorker();

export const loadREDCapImportData = async (config: REDCapImportConfiguration): Promise<Map<string,Concept>> => {
    return new Promise( async (resolve, reject) => {
        const concepts = await worker.loadConfig(config) as Map<string,Concept>;
        resolve(concepts);
    });
};

export const calculateREDCapFieldCount = async (field_name: string, search_value?: any): Promise<number> => {
    return new Promise( async (resolve, reject) => {
        const count = await worker.calculatePatientCount(field_name, search_value) as OutboundMessageResultCount;
        resolve(count.value);
    });
};