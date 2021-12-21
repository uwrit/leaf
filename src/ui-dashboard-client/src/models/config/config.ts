import { PatientListDatasetShape } from "../patientList/Dataset";
import { ContentType } from "./content";

export interface DashboardConfig {
    main: MainPageConfig;
    patient: PatientPageConfig;
};

export interface DashboardPageConfig {
    title: string;
    
};

export interface MainPageConfig extends DashboardPageConfig {
    cohortId: string;
    content: ContentType[];
    datasets: DatasetConfig[];
};

export interface DatasetConfig {
    id: string,
    shape: PatientListDatasetShape;
}

export interface PatientPageConfig extends DashboardPageConfig {
    content: ContentType[];
    demographics: DemographicsConfig;
    search: SearchConfig;
};

export interface SearchConfig {
    enabled: boolean;
};

export interface DemographicsConfig {
    datasetId: string;
    fieldName?: string;
    fieldAge?: string;
    fieldSex?: string;
};