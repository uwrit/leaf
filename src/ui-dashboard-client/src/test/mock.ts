import { DashboardConfig } from "../models/config/config";

export const config: DashboardConfig = 
{
    main: {
        title: "UW Memory and Brain Wellness Dashboard"
    },
    patient: {
        search: {
            enabled: true
        },
        content: [
            {
                type: "row",
                content: [
                    {
                        color: [143, 31, 177],
                        icon: "checklist",    
                        type: "checklist",     
                        title: "Quality Care Checklists",
                        width: 44,
                        datasets: [
                            {
                                title: "MBWC Quality Measures",
                                id: "f0f1423e-f36b-1410-81bf-0018c8508655",
                                items: [
                                    "MRI Brain","FDG PET Brain","CSF","Hearing Screening","Vision Screening","Family Conference","Neuropsychology","MoCA","MMSE","In MBWC Program"
                                ]
                            }
                        ]
                        
                    },
                    {
                        color: [35, 122, 35],
                        icon: "plus",
                        type: "list",
                        title: "Problem List",
                        width: 29,
                        datasetId: "f2f1423e-f36b-1410-81bf-0018c8508655"
                    },
                    {
                        color: [36, 77, 138],
                        icon: "med",
                        type: "list",
                        title: "Active Medications",
                        width: 28,
                        datasetId: "f4f1423e-f36b-1410-81bf-0018c8508655"
                    }
                ]
            },
            {
                type: "timeline",
                title: "Clinical Course Timeline",
                comparison: {
                    enabled: true,
                    filters: [
                        { datasetId: "demographics", column: "age", args: { numeric: { pad: 5 } } },
                        { datasetId: "demographics", column: "gender" },
                        { datasetId: "f2f1423e-f36b-1410-81bf-0018c8508655", column: "prob_id", args: { string: { pickerDisplayColumn: "prob_name" } } }
                    ],
                    title: "MWBC Population Comparison"
                },
                export: {
                    enabled: true
                },
                eventDatasets: [
                    {
                        color: [153, 18, 194],
                        icon: "plus",
                        id: "ebf1423e-f36b-1410-81bf-0018c8508655"
                    },
                    {
                        color: [197, 118, 14],
                        icon: "person",
                        id: "9803433e-f36b-1410-81c7-0018c8508655"
                    },
                    {
                        color: [192, 31, 45],
                        id: "9a03433e-f36b-1410-81c7-0018c8508655"
                    },
                    {
                        color: [41, 75, 226],
                        icon: "med",
                        id: "a103433e-f36b-1410-81c7-0018c8508655"
                    }
                ],
                numericDatasets: [
                    {
                        title: "Body weight (lbs)",
                        color: [41, 75, 226],
                        context: {
                            fields: []
                        },
                        id: "d6f1423e-f36b-1410-81bf-0018c8508655"
                    },
                    {
                        title: "PHQ9 score",
                        color: [57, 181, 238],
                        id: "d9f1423e-f36b-1410-81bf-0018c8508655"
                    },
                    {
                        title: "MoCA score",
                        color: [153, 18, 194],
                        id: "e0f1423e-f36b-1410-81bf-0018c8508655"
                    },
                    {
                        title: "NPI Severity",
                        color: [197, 118, 14],
                        id: "e3f1423e-f36b-1410-81bf-0018c8508655"
                    },
                    {
                        title: "# Intact iADLs",
                        color: [16, 180, 24],
                        id: "e6f1423e-f36b-1410-81bf-0018c8508655"
                    }
                ]
            }
        ]
    }
}