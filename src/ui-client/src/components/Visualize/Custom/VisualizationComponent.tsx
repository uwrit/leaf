/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { View, ViewListener } from 'react-vega';
import { VegaLite, VisualizationSpec } from '../../../bundled/react-vega' //'react-vega';
import { VisualizationDatasetState } from '../../../models/state/CohortState';
import { VisualizationComponent as VisualizationComponentModel } from '../../../models/visualization/Visualization';
import { SectionHeader } from '../../Other/SectionHeader/SectionHeader';

interface Props {
    adminMode?: boolean;
    clickHandler: () => any;
    datasets: Map<string, VisualizationDatasetState>;
    isSelected?: boolean;
    model: VisualizationComponentModel;
    pageWidth: number;
    viewUpdateHandler?: ViewListener;
}

interface State {
    hidden: boolean;
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
        console.log("This is an error we could capture!", error, errorInfo);
    }

    public render() {
        const { clickHandler } = this.props;
        const c = this.classname;
        const err = this.state.errored;

        return (
            <div className={c} onClick={clickHandler.bind(null)}>
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

class VisualizationComponentInternal extends React.PureComponent<Props, State> {
    private className = 'visualization-component';

    public constructor(props: Props) {
        super(props);
        this.state = {
            hidden: true
        }
    }

    public componentDidMount() {
        setTimeout(() => this.setState({ hidden: false }), this.props.model.orderId * 300);
    }

    public render() {
        const c = this.className;
        const { adminMode, model, isSelected } = this.props;
        const { hidden } = this.state;

        if (!model.datasetQueryRefs.length) return null;
        const spec = this.getSpec();
        const style = spec ? this.getStyle(spec) : null;
        const classes = [ c ];

        if (adminMode)  classes.push('selectable');
        if (isSelected) classes.push('selected');
        if (hidden)     classes.push('hidden');

        return (
            <div className={classes.join(' ')}>
                <SectionHeader headerText={model.header} subText={model.subHeader} />

                {/* Visualization */}
                {spec &&
                <div className={c}>
                    <div className={`${c}-inner`} style={style}>
                        <VegaLite spec={spec as VisualizationSpec} renderer="svg" onNewView={this.handleViewUpdate} />
                    </div>
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

    private handleViewUpdate = (view: View) => {
        const { viewUpdateHandler, isSelected } = this.props;
        if (isSelected && viewUpdateHandler) {
            viewUpdateHandler(view);
        }
    }

    private getStyle = (userSpec: any): React.CSSProperties => {
        const style: React.CSSProperties = { width: userSpec.width };
        if (userSpec['background'] && userSpec['background']['url']) {
            style.background = `url(${userSpec['background'] && userSpec['background']['url']})`;
        }
        return style;
    }

    private getSpec = () => {
        const { model, pageWidth } = this.props;
        const { jsonSpec, datasetQueryRefs } = model;
        const defaultWidth = model.isFullWidth ? pageWidth : pageWidth / 2;

        const userSpec = this.parseJson(jsonSpec);
        if (!userSpec) return;

        /**
         * Generate base spec (literally just `$schema` & `data`)
         */
        const leafGeneratedSpec: any = {
            datasets: this.getDatasets(), 
            $schema: "https://vega.github.io/schema/vega-lite/v5.json",
            data: { name: datasetQueryRefs[0].name }
        };

        /**
         * Merge Leaf-generated & user spec, user settings override defaults
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

    private getDatasets = () => {
        const { model, datasets } = this.props;
        const dataObj: any = {};

        for (const dsref of model.datasetQueryRefs) {
            const dataset = datasets.get(dsref.id);
            if (dataset) {
                dataObj[dsref.name] = dataset.data;
            }
        }
        
        return dataObj;
    }
}