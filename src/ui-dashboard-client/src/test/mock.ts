import { DashboardConfig } from "../models/config/config";
import { PatientListDatasetShape } from "../models/patientList/Dataset";

export const config: DashboardConfig = 
{
    main: {
        title: "UW Memory and Brain Wellness Dashboard",
        cohortId: "d3f1423e-f36b-1410-81bf-0018c8508655",
        datasetIds: [
            "d6f1423e-f36b-1410-81bf-0018c8508655",
            "d9f1423e-f36b-1410-81bf-0018c8508655",
            "e0f1423e-f36b-1410-81bf-0018c8508655",
            "e3f1423e-f36b-1410-81bf-0018c8508655",
            "e6f1423e-f36b-1410-81bf-0018c8508655",
            "ebf1423e-f36b-1410-81bf-0018c8508655",
            "f0f1423e-f36b-1410-81bf-0018c8508655",
            "f2f1423e-f36b-1410-81bf-0018c8508655",
            "f4f1423e-f36b-1410-81bf-0018c8508655"
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