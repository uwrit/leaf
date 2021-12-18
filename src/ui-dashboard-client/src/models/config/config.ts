import { ContentType } from "./content";

export interface DashboardConfig {
    main: MainPageConfig;
    patient: PatientPageConfig;
};

interface DashboardPageConfig {
    title: string;
    
};

interface MainPageConfig extends DashboardPageConfig {
    cohortId: string;
    content: ContentType[];
    datasetIds: string[];
};

interface PatientPageConfig extends DashboardPageConfig {
    content: ContentType[];
    demographics: DemographicsConfig;
    search: SearchConfig;
};

interface SearchConfig {
    enabled: boolean;
};

interface DemographicsConfig {
    datasetId: string;
    fieldName?: string;
    fieldAge?: string;
    fieldSex?: string;
};