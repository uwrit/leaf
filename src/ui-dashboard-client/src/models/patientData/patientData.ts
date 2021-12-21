import { PatientListRowDTO } from "../patientList/Patient";


export interface PatientData {
    data: Map<string, PatientDataset>;
}

interface PatientDataset {
    id: string;
    data: PatientListRowDTO[];
}