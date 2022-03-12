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
    state: CohortStateType;
}

export interface CohortData {
    patients: Map<PatientId, PatientData>;
    metadata: Map<DatasetId, DatasetMetadata>;
}

export interface PatientData {
    demographics: DemographicRow;
    datasets: Map<DatasetId, PatientListRow[]>;
}

export interface DatasetMetadata {
    schema: PatientListDatasetSchema;
    ref: PatientListDatasetQueryDTO;
}