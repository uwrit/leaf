import { PatientListDatasetResults } from "../patientList/Dataset";

export interface CohortData {
    data: Map<string, CohortDataset>;
}

interface CohortDataset {
    id: string;
    data: PatientListDatasetResults;
}