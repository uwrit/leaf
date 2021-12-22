import { PatientListRowDTO } from "../patientList/Patient";

export type CohortDataMap = Map<string, Map<string, PatientListRowDTO[]>>;

export interface CohortData {
    data: CohortDataMap;
}