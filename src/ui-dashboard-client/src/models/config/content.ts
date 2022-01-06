
/**
 * Types
 */
export type ContentIdType =  "row" | "checklist" | "list" | "timeline";

export type ContentType = 
    ContentRowConfig  | ContentChecklistConfig |
    ContentListConfig | ContentTimelineConfig;

export type RgbValues = [ number, number, number ];

export type Icons = "checklist" | "plus" | "med";

/**
 * Abstract config type
 */
interface BaseContentConfig {
    type: ContentIdType;
};

interface TitledContentConfig extends BaseContentConfig {
    title: string;
}

interface StyledContentConfig extends TitledContentConfig {
    color?: RgbValues;
    icon?: Icons;
    width?: number;
};

/**
 * Row
 */
export interface ContentRowConfig extends BaseContentConfig {
    content: (ContentChecklistConfig | ContentListConfig | ContentTimelineConfig)[];
};

/**
 * List
 */
export interface ContentListConfig extends StyledContentConfig {
    datasetId: string;
};

/**
 * Checklist
 */
export interface ContentChecklistConfig extends StyledContentConfig {
    datasets: ContentChecklistDatasetConfig[];
};

export interface ContentChecklistDatasetConfig {
    id: string;
    items: string[];
    title: string;
};

/**
 * Timeline
 */
 export interface ContentTimelineConfig extends BaseContentConfig {
    datasets: ContentTimelineDatasetConfig[];
    export: ContentTimelineExportConfig;
};

export interface ContentTimelineDatasetConfig {
    id: string;
    title: string;
};

interface ContentTimelineExportConfig {
    enabled: boolean;
};