/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { VegaLite, VisualizationSpec } from 'react-vega';
import { Col, Row } from 'reactstrap';
import { VisualizationComponent as VisualizationComponentModel } from '../../../../models/visualization/Visualization';
import { SectionHeader } from '../../../Other/SectionHeader/SectionHeader';

interface Props {
    adminMode?: boolean;
    clickHandler: (comp: VisualizationComponentModel) => any;
    data: VisualizationComponentModel;
    isSelected?: boolean;
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
        const { adminMode, isSelected, clickHandler, data } = this.props;
        const c = this.classname;
        const classes = [ c, isSelected ? 'selected' : '', adminMode ? 'clickable' : '' ].join(' ');
        const err = this.state.errored;

        return (
            <div className={classes} onClick={clickHandler.bind(null, data)}>
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
        const { data } = this.props;

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

        const d = { "values": [
            {"a": "A", "b": 28}, {"a": "B", "b": 55}, {"a": "C", "b": 43},
            {"a": "D", "b": 91}, {"a": "E", "b": 81}, {"a": "F", "b": 53},
            {"a": "G", "b": 19}, {"a": "H", "b": 87}, {"a": "I", "b": 52}
            ]
        }
        
        return (
            <div className={c}>
                <Row>
                    <Col md={data.isFullWidth ? 12 : 6}>
                        <SectionHeader headerText={data.header} />
                        <div className={c}>
                            <VegaLite spec={spec as VisualizationSpec} data={d}/>
                        </div>
                    </Col>
                </Row>
            </div>
        );
    }
}