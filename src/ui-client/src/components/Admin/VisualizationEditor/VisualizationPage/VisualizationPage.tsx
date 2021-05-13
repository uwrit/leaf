/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { VisualizationDatasetState } from '../../../../models/state/CohortState';
import { VisualizationPage as VisualizationPageModel } from '../../../../models/visualization/Visualization';
import computeDimensions from '../../../../utils/computeDimensions';
import { VisualizationComponent } from './VisualizationComponent';
import './VisualizationPage.css';

interface Props {
    adminMode?: boolean;
    editing?: boolean;
    componentClickHandler: (compIdx: number) => any;
    datasets: Map<string, VisualizationDatasetState>;
    dispatch: any;
    page: VisualizationPageModel;
    padding?: number;
    selectedComponentIndex?: number;
}

interface State {
    width: number;
}

export default class VisualizationPage extends React.PureComponent<Props, State> {
    private className = 'visualization-page';
    private maxWidth = 900;

    constructor(props: Props) {
        super(props);
        const dimensions = computeDimensions();
        this.state = { 
            width: Math.min(dimensions.contentWidth, this.maxWidth) - (this.props.padding ? this.props.padding : 0)
        };
    }

    public updateDimensions = () => {
        const dimensions = computeDimensions();
        this.setState({ width: Math.min(dimensions.contentWidth, this.maxWidth) - (this.props.padding ? this.props.padding : 0) });
    }

    public componentWillMount() {
        window.addEventListener('resize', this.updateDimensions);
    }

    public componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions);
    }

    public render() {
        const c = this.className;
        const { page, adminMode, selectedComponentIndex, componentClickHandler, datasets } = this.props;
        const { width } = this.state;
        const checkSelected = adminMode && typeof selectedComponentIndex !== 'undefined';
        const comps: any[] = [];
        let i = 0;

        while (i < page.components.length) {
            const nextComp = i <= page.components.length-1 ? page.components[i+1] : undefined;
            const comp = page.components[i];

            /**
             * If half-width & the following component is also half, add into single row
             */
            if (!comp.isFullWidth && nextComp && !nextComp.isFullWidth) {
                comps.push(
                    <div> 
                        <div>
                            <VisualizationComponent 
                                key={comp.id} 
                                adminMode={adminMode}
                                clickHandler={componentClickHandler.bind(null, i)} 
                                datasets={datasets}
                                isSelected={checkSelected && selectedComponentIndex === i}
                                model={comp}
                                pageWidth={width}
                            />
                        </div>
                        <div>
                            <VisualizationComponent 
                                key={comp.id} 
                                adminMode={adminMode}
                                clickHandler={componentClickHandler.bind(null, i+1)} 
                                datasets={datasets}
                                isSelected={checkSelected && selectedComponentIndex === i+1}
                                model={comp}
                                pageWidth={width}
                            />
                        </div>
                    </div>
                );
                i += 2;

            /**
             * Else add just this component into a row
             */
            } else {
                comps.push(
                    <div> 
                        <div>
                            <VisualizationComponent 
                                key={comp.id} 
                                adminMode={adminMode}
                                clickHandler={componentClickHandler.bind(null, i)} 
                                datasets={datasets}
                                isSelected={checkSelected && selectedComponentIndex === i}
                                model={comp}
                                pageWidth={width - (this.props.padding ? this.props.padding : 0)}
                            />
                        </div>
                    </div>
                );
                i++;
            }
        }

        return (
            <div className={c}>
                {comps}
            </div>);
    }
}