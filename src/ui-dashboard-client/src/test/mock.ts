import { DashboardConfig } from "../models/config/config";
import { PatientListDatasetShape } from "../models/patientList/Dataset";

export const config: DashboardConfig = 
{
    main: {
        title: "Memory and Brain Wellness Dashboard",
        cohortId: "d3f1423e-f36b-1410-81bf-0018c8508655",
        datasets: [
            { id: "d6f1423e-f36b-1410-81bf-0018c8508655", shape: PatientListDatasetShape.Dynamic },
            { id: "d9f1423e-f36b-1410-81bf-0018c8508655", shape: PatientListDatasetShape.Dynamic },
            { id: "e0f1423e-f36b-1410-81bf-0018c8508655", shape: PatientListDatasetShape.Dynamic },
            { id: "e3f1423e-f36b-1410-81bf-0018c8508655", shape: PatientListDatasetShape.Dynamic },
            { id: "e6f1423e-f36b-1410-81bf-0018c8508655", shape: PatientListDatasetShape.Dynamic },
            { id: "ebf1423e-f36b-1410-81bf-0018c8508655", shape: PatientListDatasetShape.Dynamic },
            { id: "f0f1423e-f36b-1410-81bf-0018c8508655", shape: PatientListDatasetShape.Dynamic },
            { id: "f2f1423e-f36b-1410-81bf-0018c8508655", shape: PatientListDatasetShape.Dynamic },
            { id: "f4f1423e-f36b-1410-81bf-0018c8508655", shape: PatientListDatasetShape.Dynamic }
        ],
        content: []
    },
    patient: {
        title: "Memory and Brain Wellness Dashboard",
        search: {
            enabled: true
        },
        demographics: {
            datasetId: "",
            fieldName: "Name",
            fieldAge: "Age",
            fieldSex: "Sex"
        },
        content: [
            {
                type: "row",
                content: [
                    {
                        
                        type: "checklist",
                        title: "Quality Care Checklists",
                        width: 6,
                        datasets: [
                            {
                                title: "MBWC Quality Measures",
                                datasetId: "f0f1423e-f36b-1410-81bf-0018c8508655",
                                fieldValues: "obs_value_str",
                                items: [
                                    "MRI Brain","FDG PET Brain","CSF","Hearing Screening","Vision Screening","Family Conference","Neuropsychology","MoCA", "MMSE"
                                ]
                            }
                        ]
                        
                    },
                    {
                        type: "list",
                        title: "Problem List",
                        width: 3,
                        datasetId: "f2f1423e-f36b-1410-81bf-0018c8508655",
                        fieldName: "prob_name",
                        fieldDate: "prob_date"
                    },
                    {
                        type: "list",
                        title: "Active Medications",
                        width: 3,
                        datasetId: "f4f1423e-f36b-1410-81bf-0018c8508655",
                        fieldName: "med_name",
                        fieldDate: "med_date"
                    }
                ]
            },
            {
                type: "timeline",
                title: "Clinical Course Timeline",
                export: {
                    enabled: true
                },
                datasets: [
                    {
                        title: "Body weight (lbs)",
                        datasetId: "d6f1423e-f36b-1410-81bf-0018c8508655"
                    },
                    {
                        title: "PHQ9 score",
                        datasetId: "d9f1423e-f36b-1410-81bf-0018c8508655"
                    },
                    {
                        title: "MoCA score",
                        datasetId: "e0f1423e-f36b-1410-81bf-0018c8508655"
                    },
                    {
                        title: "NPI Severity",
                        datasetId: "e3f1423e-f36b-1410-81bf-0018c8508655"
                    },
                    {
                        title: "# Intact iADLs",
                        datasetId: "e6f1423e-f36b-1410-81bf-0018c8508655"
                    },
                    {
                        title: "Latest Social / Health Change",
                        datasetId: "ebf1423e-f36b-1410-81bf-0018c8508655"
                    }
                ]
            }
        ]
    }
}