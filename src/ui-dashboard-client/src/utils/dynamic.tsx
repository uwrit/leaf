import React from "react";
import DynamicChecklist from "../components/Dynamic/Checklist/Checklist";
import DynamicList from "../components/Dynamic/List/List";
import DynamicRow from "../components/Dynamic/Row/Row";
import { WidgetChecklistConfig, WidgetListConfig, WidgetRowConfig, WidgetTimelineConfig, WidgetType, Icons } from "../models/config/content";
import { DatasetId, DatasetMetadata, PatientData } from "../models/state/CohortState";
import { RgbValues } from "../models/config/content";
import { VscChecklist } from "react-icons/vsc";
import { FiPlus } from "react-icons/fi";
import { GiMedicines } from "react-icons/gi";
import DynamicTimeline from "../components/Dynamic/Timeline/Timeline";

export const renderDynamicComponent = (
        content: WidgetType, 
        patient: PatientData, 
        metadata: Map<DatasetId, DatasetMetadata>,
        key?: string | number)
    : JSX.Element | null => {
    switch (content.type) {
        case "row":       return <DynamicRow key={key} config={content as WidgetRowConfig} patient={patient} metadata={metadata} />;
        case "list":      return <DynamicList key={key} config={content as WidgetListConfig} patient={patient} metadata={metadata} />;
        case "checklist": return <DynamicChecklist key={key} config={content as WidgetChecklistConfig} patient={patient} metadata={metadata} />;
        case "timeline":  return <DynamicTimeline key={key} config={content as WidgetTimelineConfig} patient={patient} metadata={metadata} />;;
        default:
            return null;
    }
};

const defaultColor: RgbValues = [36, 77, 138];
export const getDynamicColor = (rgb?: RgbValues, transparent?: number): string => {
    let vals: any;
    if (typeof(rgb) === 'undefined') { vals = defaultColor; } 
    else { vals = rgb.slice(); }

    if (typeof(transparent) != 'undefined') { vals.push(transparent); }
    return `rgb(${vals.join(',')}`;
};

export const getDynamicIcon = (icon?: Icons): JSX.Element | null => {
    switch (icon) {
        case "checklist": return <VscChecklist />;
        case "plus": return <FiPlus />;
        case "med": return <GiMedicines />
    }
    return null;
};