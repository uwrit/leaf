import { DemographicRow } from "../cohortData/DemographicDTO";
import { PatientListRowDTO } from "../patientList/Patient";

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
    patients: Map<PatientId, PatientData>;
}

export interface PatientData {
    demographics: DemographicRow;
    datasets: Map<DatasetId, PatientListRowDTO[]>;
}