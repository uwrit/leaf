export type ContentIdType = 
    "row" | "checklist" | "list" | "timeline";

export type ContentType = 
    ContentRowConfig | ContentChecklistConfig |
    ContentListConfig | ContentTimelineConfig;

/**
 * Abstract config type
 */
export interface ContentConfig {
    title?: string;
    type: ContentIdType;
}

/**
 * Row
 */
export interface ContentRowConfig extends ContentConfig {
    content: (ContentChecklistConfig | ContentListConfig | ContentTimelineConfig)[];
}

/**
 * List
 */
export interface ContentListConfig extends ContentConfig {
    datasetId: string;
    fieldDate: string;
    fieldName: string;
    width?: number;
}

/**
 * Checklist
 */
export interface ContentChecklistConfig extends ContentConfig {
    datasets: ContentChecklistDatasetConfig[];
    width?: number;
}

interface ContentChecklistDatasetConfig {
    datasetId: string;
    fieldValues: string;
    items: string[];
    title: string;
};

/**
 * Timeline
 */
 export interface ContentTimelineConfig extends ContentConfig {
    datasets: ContentTimelineDatasetConfig[];
    export: ContentTimelineExportConfig;
    width?: number;
}

interface ContentTimelineDatasetConfig {
    datasetId: string;
    title: string;
};

interface ContentTimelineExportConfig {
    enabled: boolean;
}