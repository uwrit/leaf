
/**
 * Types
 */
export type WidgetIdType =  "row" | "checklist" | "list" | "timeline";

export type WidgetType = 
    WidgetRowConfig  | WidgetChecklistConfig |
    WidgetListConfig | WidgetTimelineConfig;

export type RgbValues = [ number, number, number ];

export type Icons = "checklist" | "plus" | "med" | "person";

/**
 * Abstract config type
 */
export interface BaseWidgetConfig {
    type: WidgetIdType;
};

interface TitledWidgetConfig extends BaseWidgetConfig {
    title: string;
}

interface StyledWidgetConfig extends TitledWidgetConfig {
    color?: RgbValues;
    icon?: Icons;
    width?: number;
};

/**
 * Row
 */
export interface WidgetRowConfig extends BaseWidgetConfig {
    content: (WidgetChecklistConfig | WidgetListConfig | WidgetTimelineConfig)[];
};

/**
 * List
 */
export interface WidgetListConfig extends StyledWidgetConfig {
    datasetId: string;
};

/**
 * Checklist
 */
export interface WidgetChecklistConfig extends StyledWidgetConfig {
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
 export interface WidgetTimelineConfig extends TitledWidgetConfig {
    comparison: WidgetTimelineComparisonConfig;
    eventDatasets: WidgetTimelineEventDatasetConfig[];
    numericDatasets: WidgetTimelineNumericDatasetConfig[];
    export: WidgetTimelineExportConfig;
};

export interface WidgetTimelineEventDatasetConfig {
    id: string;
    color?: RgbValues;
    context?: WidgetTooltipContextConfig;
    icon?: Icons;
    title?: string;
};

export interface WidgetTimelineNumericDatasetConfig {
    id: string;
    color?: RgbValues;
    context?: WidgetTooltipContextConfig;
    title: string;
};

interface WidgetTooltipContextConfig {
    fields: string[];
}

interface WidgetTimelineExportConfig {
    enabled: boolean;
};

interface WidgetTimelineComparisonConfig {
    dimensions?: WidgetTimelineComparisonEntryConfig[];
    enabled: boolean;
    title: string;
};

export interface WidgetTimelineComparisonEntryConfig {
    args?: WidgetTimelineComparisonArgs;
    datasetId: string;
    column: string;
}

interface WidgetTimelineComparisonArgs {
    numeric?: WidgetTimelineComparisonNumericArgs;
    string?: WidgetTimelineComparisonStringArgs;
}

interface WidgetTimelineComparisonNumericArgs {
    pad?: number;
}

interface WidgetTimelineComparisonStringArgs {
    matchOn?: string[];
    pickerDisplayColumn?: string;
}