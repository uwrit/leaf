/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { PatientListColumn } from './Column';
import { PatientListDatasetDefinition, PatientListDatasetId } from './Dataset';

export enum PatientListSortType { NONE = 0, ASC = 1, DESC = 2 }

export enum PatientListDndType { COLUMN_HEADER = 'COLUMN_HEADER', TUPLE = 'TUPLE' }

export interface PatientListSort {
    column?: PatientListColumn;
    sortType: PatientListSortType;
}

export interface PatientListConfiguration {
    multirowDatasets: Map<PatientListDatasetId, PatientListDatasetDefinition>;
    singletonDatasets: Map<PatientListDatasetId, PatientListDatasetDefinition>;
    customColumnNames: Map<string, string>;
    displayColumns: PatientListColumn[];
    isFetching: boolean;
    fetchingDataset?: string;
    pageNumber: number;
    pageSize: number;
    sort: PatientListSort;
}