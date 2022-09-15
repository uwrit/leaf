# Dashboard UI app deployment (experimental!)
The Dashboard app is a collobatory pilot project at UW developed for visualizing a single patient's data at a time, in a configurable, dynamic way. The code here should be understood as experimental and *in-progress, subject to change* with zero guarantees of support.

The current deployment process is manual and somewhat crude. The following instructions should be considered a "best-effort" given that this work is ongoing. Please let me know if something doesn't work as expected and I can update them.

Before doing any of the below steps, first make sure you have a fully working Leaf instance (web client, API, DB). The Dashboard app is designed to be a 2nd web app deployed on an existing Leaf deployment.

## Web
1. Navigate to `/src/ui-dashboard-client`.
2. Just as when building and deploying the "standard" Leaf, run `npm install` and `npm run build` to install dependencies and create a production web client build.
3. Edit the output `/build/index.html` file, replacing all instances of `href="/static/...` with `href="/dashboard/static/...`.
4. Deploy the `/build` folder to your server alongside your existing Leaf web client, naming it something like `leaf_dashboard`.
5. The URL pattern users will use to access the Dashboard app is `https://<your_leaf_url.org>/dashboard/cohort/<queryId>/patients/<patient_id>`, so as such the most important step here is to make sure that Apache routes requests for `https://<your_leaf_url.org>/dashboard/*` to your `/leaf_dashboard/index.html` file. 

## API
The web app is designed to leverage an existing Leaf API instance thus requires no unique API deployment.

## Database
1. Run the [DB migration script at https://github.com/uwrit/leaf/blob/dashboard-v2/src/db/migration/dashboard.sql](https://github.com/uwrit/leaf/blob/dashboard-v2/src/db/migration/dashboard.sql) to create the necessary SQL schema objects necessary. Note the [JSON test data in the script](https://github.com/uwrit/leaf/blob/dashboard-v2/src/db/migration/dashboard.sql#L92), which would need to be edited in order to make the application work as expected.
2. Using an existing "standard" Leaf instance, create the `Datasets` of interest you'd like to visualize. Check the [Leaf tutorial for this](https://leafdocs.rit.uw.edu/administration/datasets/#adding-new-datasets) if this step is unclear.
3. Insert a row into the new `LeafDB.app.Dashboard` table, similar to:

```json
{
    "main": {
        "title": "Example Dashboard"
    },
    "patient": {
        "search": {
            "enabled": true
        },
        "content": [
            {
                "type": "row",
                "content": [
                    {
                        "color": [
                            143,
                            31,
                            177
                        ],
                        "icon": "checklist",
                        "type": "checklist",
                        "title": "Quality Care Checklists",
                        "width": 44,
                        "datasets": [
                            {
                                "title": "MBWC Quality Measures",
                                "id": "f0f1423e-f36b-1410-81bf-0018c8508655",
                                "items": [
                                    "MRI Brain",
                                    "FDG PET Brain",
                                    "CSF",
                                    "Hearing Screening",
                                    "Vision Screening",
                                    "Family Conference",
                                    "Neuropsychology",
                                    "MoCA",
                                    "MMSE",
                                    "In MBWC Program"
                                ]
                            }
                        ]
                    },
                    {
                        "color": [
                            35,
                            122,
                            35
                        ],
                        "icon": "plus",
                        "type": "list",
                        "title": "Problem List",
                        "width": 29,
                        "datasetId": "f2f1423e-f36b-1410-81bf-0018c8508655"
                    },
                    {
                        "color": [
                            36,
                            77,
                            138
                        ],
                        "icon": "med",
                        "type": "list",
                        "title": "Active Medications",
                        "width": 28,
                        "datasetId": "f4f1423e-f36b-1410-81bf-0018c8508655"
                    }
                ]
            },
            {
                "type": "timeline",
                "title": "Clinical Course Timeline",
                "comparison": {
                    "enabled": true,
                    "filters": [
                        {
                            "datasetId": "demographics",
                            "column": "age",
                            "args": {
                                "numeric": {
                                    "pad": 5
                                }
                            },
                            "enabled": true,
                            "text": "Age"
                        },
                        {
                            "datasetId": "demographics",
                            "column": "gender",
                            "enabled": true,
                            "text": "Gender"
                        },
                        {
                            "datasetId": "f2f1423e-f36b-1410-81bf-0018c8508655",
                            "column": "prob_id",
                            "args": {
                                "string": {
                                    "pickerDisplayColumn": "prob_name"
                                }
                            },
                            "text": "Diagnoses"
                        }
                    ],
                    "title": "MWBC Population Comparison"
                },
                "export": {
                    "enabled": true
                },
                "eventDatasets": [
                    {
                        "color": [
                            153,
                            18,
                            194
                        ],
                        "icon": "plus",
                        "id": "ebf1423e-f36b-1410-81bf-0018c8508655"
                    },
                    {
                        "color": [
                            197,
                            118,
                            14
                        ],
                        "icon": "person",
                        "id": "9803433e-f36b-1410-81c7-0018c8508655"
                    },
                    {
                        "color": [
                            192,
                            31,
                            45
                        ],
                        "id": "9a03433e-f36b-1410-81c7-0018c8508655"
                    },
                    {
                        "color": [
                            41,
                            75,
                            226
                        ],
                        "icon": "med",
                        "id": "a103433e-f36b-1410-81c7-0018c8508655"
                    }
                ],
                "numericDatasets": [
                    {
                        "title": "Body weight (lbs)",
                        "color": [
                            41,
                            75,
                            226
                        ],
                        "context": {
                            "fields": []
                        },
                        "id": "d6f1423e-f36b-1410-81bf-0018c8508655"
                    },
                    {
                        "title": "PHQ9 score",
                        "color": [
                            57,
                            181,
                            238
                        ],
                        "id": "d9f1423e-f36b-1410-81bf-0018c8508655"
                    },
                    {
                        "title": "MoCA score",
                        "color": [
                            153,
                            18,
                            194
                        ],
                        "id": "e0f1423e-f36b-1410-81bf-0018c8508655"
                    },
                    {
                        "title": "NPI Severity",
                        "color": [
                            197,
                            118,
                            14
                        ],
                        "id": "e3f1423e-f36b-1410-81bf-0018c8508655"
                    },
                    {
                        "title": "# Intact iADLs",
                        "color": [
                            16,
                            180,
                            24
                        ],
                        "id": "e6f1423e-f36b-1410-81bf-0018c8508655"
                    }
                ]
            }
        ]
    }
}
```

Under `patient`:`content`, there are 4 different `type` widgets: `list`, `checklist`, `row`, and `timeline`. The long UUID names (under the properties `id` or `datasetId`, depending on widget type) correspond to dataset IDs in Leaf, stored in the `app.DatasetQuery` table `id` column. The property names are hopefully intuitive. Note that `row` widgets allow a nesting of child widgets where the `width` property of children is used as the % width of screen.

4. In a "standard" Leaf instance, create and save a query of the group of patients of interest to you. The critical piece here is to find the `queryId` representing the cohort. This is essentially invisible to users while they are using Leaf, but can be found either by having the developer console open to the "Network" tab while saving the query (look at the API calls, which should show a long UUID like "https://leaf.org/api/query/<this_is_the_queryid>"), or by checking the `app.Query` table `Id` column.


After doing these steps, navigate to `https://<your_leaf_url.org>/dashboard/cohort/<queryId>` and see if the app loads correctly. If not, keep the developer console open and check the network calls to see which one fails. I understand this is not a great troubleshooting method, but as earlier stated, this project is still very much in-progress. Good luck!