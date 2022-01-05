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
    color?: RgbValues;
    datasetId: string;
    fieldDate: string;
    fieldName: string;
    width?: number;
}

/**
 * Checklist
 */
export interface ContentChecklistConfig extends ContentConfig {
    color?: RgbValues;
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

export interface zzRgbValues {
    red: number;
    green: number;
    blue: number;
}

export type RgbValues = [number,number,number];