import React from "react";
import DynamicChecklist from "../components/Dynamic/Checklist/Checklist";
import DynamicList from "../components/Dynamic/List/List";
import DynamicRow from "../components/Dynamic/Row/Row";
import { ContentChecklistConfig, ContentListConfig, ContentRowConfig, ContentType, Icons } from "../models/config/content";
import { PatientData } from "../models/state/CohortState";
import { RgbValues } from "../models/config/content";
import { VscChecklist } from "react-icons/vsc";
import { FiPlus } from "react-icons/fi";
import { GiMedicines } from "react-icons/gi";

export const renderDynamicComponent = (content: ContentType, patient: PatientData, key?: string | number): JSX.Element | null => {
    switch (content.type) {
        case "row":       return <DynamicRow key={key} config={content as ContentRowConfig} patient={patient} />;
        case "list":      return <DynamicList key={key} config={content as ContentListConfig} patient={patient} />;
        case "checklist": return <DynamicChecklist key={key} config={content as ContentChecklistConfig} patient={patient} />;;
        case "timeline":  return null;
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