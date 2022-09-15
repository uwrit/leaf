import { PatientListDatasetDynamicSchema, PatientListDatasetShape } from "../models/patientList/Dataset";
import { DefTemplates } from "../models/patientList/DatasetDefinitionTemplate";
import { DatasetMetadata } from "../models/state/CohortState";


export interface DatasetMetadataColumns {
    fieldDate?: string;
    fieldValueString?: string;
    fieldValueNumeric?: string;
}

export const getDatasetMetadataColumns = (meta: DatasetMetadata): DatasetMetadataColumns => {
    const output: DatasetMetadataColumns = {};

    if (meta.ref.shape == PatientListDatasetShape.Dynamic) {
            const dynSchema = meta.schema as PatientListDatasetDynamicSchema;
            if (dynSchema.sqlFieldDate)         { output.fieldDate = dynSchema.sqlFieldDate; }
            if (dynSchema.sqlFieldValueString)  { output.fieldValueString = dynSchema.sqlFieldValueString; }
            if (dynSchema.sqlFieldValueNumeric) { output.fieldValueNumeric = dynSchema.sqlFieldValueNumeric; }
            return output;
    } else {
        const def = DefTemplates.get(meta.ref.shape);
        if (def) {
            if (def.dateValueColumn)    { output.fieldDate = def.dateValueColumn; }
            if (def.stringValueColumn)  { output.fieldValueString = def.stringValueColumn; }
            if (def.numericValueColumn) { output.fieldValueNumeric = def.numericValueColumn; }
        }
        return output;
    }
};