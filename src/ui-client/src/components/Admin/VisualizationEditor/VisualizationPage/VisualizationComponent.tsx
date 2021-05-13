/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { VegaLite, VisualizationSpec } from 'react-vega';
import { VisualizationDatasetState } from '../../../../models/state/CohortState';
import { VisualizationComponent as VisualizationComponentModel } from '../../../../models/visualization/Visualization';
import { SectionHeader } from '../../../Other/SectionHeader/SectionHeader';

interface Props {
    adminMode?: boolean;
    clickHandler: () => any;
    datasets: Map<string, VisualizationDatasetState>;
    isSelected?: boolean;
    model: VisualizationComponentModel;
    pageWidth: number;
}

interface ErrorBoundaryState {
    errored: boolean;
}

export class VisualizationComponent extends React.Component<Props, ErrorBoundaryState> {
    private classname = 'visualize-component-container';
    constructor(props: Props) {
        super(props);
        this.state = { 
            errored: false
        };
    }

    public static getDerivedStateFromError(error: any) {
        console.log(error);
        return { errored: true };
    }
    
    public componentDidCatch(error: any, errorInfo: any) {    
        console.log(error, errorInfo);
    }

    public render() {
        const { adminMode, isSelected, clickHandler } = this.props;
        const c = this.classname;
        const classes = [ c, isSelected ? 'selected' : '', adminMode ? 'clickable' : '' ].join(' ');
        const err = this.state.errored;

        return (
            <div className={classes} onClick={clickHandler.bind(null)}>
                {!err &&
                <VisualizationComponentInternal {...this.props} />
                }

                {err && 
                 <div className={`${c}-error`}>
                    <p>
                        Whoops! An error occurred while creating patient visualizations. We are sorry for the inconvenience. 
                        Please contact your Leaf administrator if this error continues.
                    </p>
                </div>
                }
            </div>
        );
    }
}

class VisualizationComponentInternal extends React.PureComponent<Props> {
    private className = 'visualization-component';

    public render() {
        const c = this.className;
        const { adminMode, model, isSelected } = this.props;

        const spec = this.getSpec();
        const data = this.getData();

        return (
            <div className={`${c} ${adminMode ? 'selectable' : ''} ${isSelected ? 'selected' : ''}`}>
                <SectionHeader headerText={model.header} subText={model.subHeader} />

                {/* Visualization */}
                {spec &&
                <div className={c}>
                    <VegaLite spec={spec as VisualizationSpec} data={data}/>
                </div>
                }

                {/* Invalid spec fallback */}
                {!spec &&
                <div className={`${c}-invalid`}>
                    <p>
                        {adminMode && "It looks like your Vega .json object has invalid syntax!"}
                        {!adminMode && "A problem occurred while generating the Leaf visualization. Please contact your Leaf administrator"}
                    </p>
                </div>
                }
            </div>
        );
    }

    private getSpec = () => {
        const { model, pageWidth } = this.props;
        const { jsonSpec, datasetQueryRefs } = model;
        const defaultWidth = model.isFullWidth ? pageWidth : pageWidth / 2;

        /**
         * Generate base spec (literally just `$schema` & `data`)
         */
        const leafGeneratedSpec: any = {
            $schema: "https://vega.github.io/schema/vega-lite/v5.json",
            data: datasetQueryRefs.length > 1
                ? datasetQueryRefs.map(dsref => ({ name: dsref.name }))
                : { name: datasetQueryRefs.length ? datasetQueryRefs[0].name : '' }
        };
        const userSpec = this.parseJson(jsonSpec);
        if (!userSpec) return;

        /**
         * Merge Leaf-generated & user spec 
         */ 
        const merged = {
            ...leafGeneratedSpec,
            ...userSpec
        };

        /**
         * Compute width. User-defined width is used if available
         * and less than allowed maximum
         */
        merged.width = typeof merged['width'] === 'undefined'
            ? defaultWidth
            : Math.min(merged.width, defaultWidth)

        return merged;
    }

    /** 
     * Transform user json string to object w/ validity check
     * Code adapted from https://stackoverflow.com/a/20392392
     */ 
    private parseJson = (json: string) => {
        try {
            const o = JSON.parse(json);
            if (o && typeof o === "object") return o;
        } catch (e) { }
        return false;
    }

    private getData = () => {
        const { model, datasets } = this.props;
        const dataObj: any = {};

        for (const dsref of model.datasetQueryRefs) {
            const dataset = datasets.get(dsref.id);
            if (dataset) {
                //dataObj["values"] = this.dummyData();
                dataObj[dsref.name] = dataset.data;
            }
        }
        
        return dataObj;
    }

    public demorender() {
        const c = this.className;
        const { model } = this.props;

        const spec = {
            width: 800,
            height: 400,
            "data": {
                "name": "values"
            },
            "params": [
                {
                    "name": "highlight",
                    "select": { "type": "point", "on": "mouseover" }
                },
                { "name": "select", "select": "point" },
                {
                    "name": "cornerRadius", "value": 0,
                    "bind": { "input": "range", "min": 0, "max": 50, "step": 1 }
                }
            ],
            "mark": {
                "type": "bar",
                "fill": "#4C78A8",
                "stroke": "black",
                "cursor": "pointer",
                "cornerRadius": { "expr": "cornerRadius" }
            },
            "encoding": {
                "x": { "field": "a", "type": "ordinal" },
                "y": { "field": "b", "type": "quantitative" },
                "fillOpacity": {
                    "condition": { "param": "select", "value": 1 },
                    "value": 0.3
                },
                "strokeWidth": {
                    "condition": [
                        {
                            "param": "select",
                            "empty": false,
                            "value": 2
                        },
                        {
                            "param": "highlight",
                            "empty": false,
                            "value": 1
                        }
                    ],
                    "value": 0
                }
            },
            "config": {
                "scale": {
                    "bandPaddingInner": 0.2
                }
            }
        } as any;

        const data = { "values": [
            {"a": "A", "b": 28}, {"a": "B", "b": 55}, {"a": "C", "b": 43},
            {"a": "D", "b": 91}, {"a": "E", "b": 81}, {"a": "F", "b": 53},
            {"a": "G", "b": 19}, {"a": "H", "b": 87}, {"a": "I", "b": 52}
            ]
        };

        console.log('dummy', spec, data);
        return;
        return (
            <div className={c}>
                <SectionHeader headerText={model.header} subText={model.subHeader} />
                <div className={c}>
                    <VegaLite spec={spec as VisualizationSpec} data={data}/>
                </div>
            </div>
        );
    }

    private dummyData = () => {
        return [
            {"a": "A", "b": 28}, {"a": "B", "b": 55}, {"a": "C", "b": 43},
            {"a": "D", "b": 91}, {"a": "E", "b": 81}, {"a": "F", "b": 53},
            {"a": "G", "b": 19}, {"a": "H", "b": 87}, {"a": "I", "b": 52}
        ];
    }
}