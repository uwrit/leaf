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
    datasetIds: string[];
};

export interface PatientPageConfig extends DashboardPageConfig {
    content: ContentType[];
    search: SearchConfig;
};

export interface SearchConfig {
    enabled: boolean;
};