import { DemographicRow } from "../cohortData/DemographicDTO";
import { PatientListDatasetQueryDTO, PatientListDatasetSchema } from "../patientList/Dataset";
import { PatientListRow } from "../patientList/Patient";

export type PatientId = string;
export type DatasetId = string;

export enum CohortStateType {
    REQUESTING = 1,
    NOT_LOADED = 2,
    LOADED = 3,
    IN_ERROR = 4,
    NOT_IMPLEMENTED = 5
}

export interface CohortState {
    data: CohortData;
    search: CohortSearch;
    state: CohortStateType;
}

export interface CohortSearch {
    hints: DemographicRow[];
    term: string;
}

export interface CohortData {
    patients: Map<PatientId, PatientData>;
    metadata: Map<DatasetId, DatasetMetadata>;
    comparison: CohortComparisonResult;
}

export interface PatientData {
    id: string;
    demographics: DemographicRow;
    datasets: Map<DatasetId, PatientListRow[]>;
}

export interface DatasetMetadata {
    schema: PatientListDatasetSchema;
    ref: PatientListDatasetQueryDTO;
}

export interface CohortComparisonResult {
    values: Map<string, number>;
    n: number;
}