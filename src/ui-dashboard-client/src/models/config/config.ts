import { WidgetType } from "./content";

export interface DashboardConfig {
    main: MainPageConfig;
    patient: PatientPageConfig;
};

export interface MainPageConfig {
    cohortId: string;
    content: WidgetType[];
    datasetIds: string[];
    title: string;
};

export interface PatientPageConfig {
    content: WidgetType[];
    search: SearchConfig;
};

export interface SearchConfig {
    enabled: boolean;
};