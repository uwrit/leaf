/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { PatientListRowDTO } from '../patientList/Patient';

export interface DemographicDTO {
    patients: PatientListRowDTO[];
    statistics: DemographicStatistics;
}

export interface BinarySplitPair {
    category: string;
    left: BinarySplit;
    right: BinarySplit;
}

export interface BinarySplit {
    color?: string;
    label: string;
    value: number;
}

export interface DemographicStatistics {
    binarySplitData: BinarySplitPair[];
    ageByGenderData: AgeByGenderData;
    languageByHeritageData: VariableBucketSet;
    religionData: VariableBucketSet;
}

export interface AgeByGenderData {
    buckets: AgeByGenderBuckets;
}

export interface AgeByGenderBuckets {
    '<1': AgeByGenderBucket;
    '1-9': AgeByGenderBucket;
    '10-17': AgeByGenderBucket;
    '18-24': AgeByGenderBucket;
    '25-34': AgeByGenderBucket;
    '35-44': AgeByGenderBucket;
    '45-54': AgeByGenderBucket;
    '55-64': AgeByGenderBucket;
    '65-74': AgeByGenderBucket;
    '75-84': AgeByGenderBucket;
    '>84': AgeByGenderBucket;
}

export interface AgeByGenderBucket {
    females: number;
    males: number;
    others: number;
}

export interface VariableBucketSet {
    data: VariableBuckSetProperty;
    subBucketTotals: SubBucketTotals;
}

interface VariableBuckSetProperty {
    buckets: VariableBucketMap;
}

interface VariableBucketMap {
    [key:string]: VariableBucketMapProperty;
}

interface VariableBucketMapProperty {
    subBuckets: VariableSubBucketMap
}

interface VariableSubBucketMap {
    [key:string]: number
}

interface SubBucketTotals {
    [key:string]: number;
}