import { DemographicRow } from "../models/cohortData/DemographicDTO";
import PatientSearchEngineWebWorker from "../providers/patientSearch/patientSearchWebWorker";

const engine = new PatientSearchEngineWebWorker();

export const indexPatients = (patients: DemographicRow[]) => {
    return new Promise( async (resolve, reject) => {
        const result = await engine.reindexPatients(patients);
        resolve(result);
    });
};

export const searchPatients = async (searchTerm: string, top?: number): Promise<DemographicRow[]> => {
    const result = await engine.searchPatients(searchTerm, top) as DemographicRow[];
    return result;
};