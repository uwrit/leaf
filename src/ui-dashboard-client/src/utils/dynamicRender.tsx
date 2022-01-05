import React from "react";
import DynamicChecklist from "../components/Dynamic/Checklist/Checklist";
import DynamicList from "../components/Dynamic/List/List";
import DynamicRow from "../components/Dynamic/Row/Row";
import { ContentChecklistConfig, ContentListConfig, ContentRowConfig, ContentType } from "../models/config/content";
import { PatientData } from "../models/state/CohortState";

export const renderDynamic = (content: ContentType, patient: PatientData): JSX.Element | null => {
    switch (content.type) {
        case "row":       return <DynamicRow config={content as ContentRowConfig} patient={patient} />;
        case "list":      return <DynamicList config={content as ContentListConfig} patient={patient} />;
        case "checklist": return <DynamicChecklist config={content as ContentChecklistConfig} patient={patient} />;;
        case "timeline":  return null;
        default:
            return null;
    }
};