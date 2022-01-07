import { DashboardConfig } from "../models/config/config";

export const config: DashboardConfig = 
{
    main: {
        title: "UW Memory and Brain Wellness Dashboard",
        cohortId: "d3f1423e-f36b-1410-81bf-0018c8508655", /* Saved Leaf cohort ID */
        datasetIds: [
            "d6f1423e-f36b-1410-81bf-0018c8508655", /* weight           */
            "d9f1423e-f36b-1410-81bf-0018c8508655", /* PHQ9             */
            "e0f1423e-f36b-1410-81bf-0018c8508655", /* MoCA             */
            "e3f1423e-f36b-1410-81bf-0018c8508655", /* NPI              */
            "e6f1423e-f36b-1410-81bf-0018c8508655", /* iADLs            */
            "ebf1423e-f36b-1410-81bf-0018c8508655", /* Life events      */
            "f0f1423e-f36b-1410-81bf-0018c8508655", /* Quality measures */
            "f2f1423e-f36b-1410-81bf-0018c8508655", /* Problem list     */
            "f4f1423e-f36b-1410-81bf-0018c8508655"  /* Medications      */
        ],
        content: []
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
                    columnText: "All MBWC Patients",
                    title: "MWBC Population Comparison"
                },
                export: {
                    enabled: true
                },
                datasets: [
                    {
                        title: "Body weight (lbs)",
                        id: "d6f1423e-f36b-1410-81bf-0018c8508655"
                    },
                    {
                        title: "PHQ9 score",
                        id: "d9f1423e-f36b-1410-81bf-0018c8508655"
                    },
                    {
                        title: "MoCA score",
                        id: "e0f1423e-f36b-1410-81bf-0018c8508655"
                    },
                    {
                        title: "NPI Severity",
                        id: "e3f1423e-f36b-1410-81bf-0018c8508655"
                    },
                    {
                        title: "# Intact iADLs",
                        id: "e6f1423e-f36b-1410-81bf-0018c8508655"
                    },
                    {
                        title: "Latest Social / Health Change",
                        id: "ebf1423e-f36b-1410-81bf-0018c8508655"
                    }
                ]
            }
        ]
    }
}