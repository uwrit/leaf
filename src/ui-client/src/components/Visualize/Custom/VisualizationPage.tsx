/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { View } from 'react-vega';
import { Col, Container, Row } from 'reactstrap';
import { CohortStateType, VisualizationDatasetState } from '../../../models/state/CohortState';
import { VisualizationDatasetQueryRef, VisualizationPage as VisualizationPageModel } from '../../../models/visualization/Visualization';
import LoaderIcon from '../../Other/LoaderIcon/LoaderIcon';
import { VisualizationComponent } from './VisualizationComponent';
import './VisualizationPage.css';

interface Props {
    adminMode?: boolean;
    editing?: boolean;
    componentClickHandler?: (compIdx: number) => any;
    datasets: Map<string, VisualizationDatasetState>;
    page: VisualizationPageModel;
    selectedComponentIndex?: number;
    width: number;
    viewUpdateHandler?: (name: string, view: View) => void;
}

export default class VisualizationPage extends React.PureComponent<Props> {
    private className = 'visualization-page';

    public render() {
        const c = this.className;
        const { page, datasets } = this.props;
        const needed = this.getAllDatasetRefs(page);
        const ready = this.checkDatasetsReady(needed);
        const failed = [ ...datasets.values() ].find(ds => ds.id in needed && ds.state === CohortStateType.IN_ERROR);

        /**
         * Show generic error if any failed
         */
         if (failed) {
            return (
                <div className={'visualize-error'}>
                    <p>
                        Whoops! An error occurred while loading patient visualizations. We are sorry for the inconvenience. 
                        Please contact your Leaf administrator if this error continues.
                    </p>
                </div>
            );
        } 

        /**
         * Show a loading spinner if datasets being pulled
         */
        if (!ready) {
            return (
                <div className={'visualize-loading'}>
                    <LoaderIcon size={100} />
                </div>
            );
        } 

        return (
            <Container fluid={true} className={c}>
                {this.getComponents()}
            </Container>);
    }

    private checkDatasetsReady = (needed: Set<VisualizationDatasetQueryRef>) => {
        const { datasets } = this.props;

        for (const dsref of needed) {
            const ds = datasets.get(dsref.id);
            if (!ds || ds.state !== CohortStateType.LOADED) {
                return false;
            }
        }
        return true;
    }

    private getAllDatasetRefs = (page: VisualizationPageModel) => new Set(page.components.map(c => c.datasetQueryRefs).flat());

    private getComponents = () => {
        const c = this.className;
        const { page, editing, adminMode, selectedComponentIndex, datasets, width, viewUpdateHandler } = this.props;
        const checkSelected = adminMode && typeof selectedComponentIndex !== 'undefined';
        const padding = width * 0.3 + (editing ? width * 0.3 : 0);
        const computedWidth = width - padding;
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
                    <Row key={comp.id + '_' + nextComp.id}> 
                        <Col md={6} id={`${c}-${comp.id}`}>
                            <VisualizationComponent 
                                key={comp.id} 
                                adminMode={adminMode}
                                clickHandler={this.handleComponentClick.bind(null, i)} 
                                datasets={datasets}
                                isSelected={checkSelected && selectedComponentIndex === i}
                                model={comp}
                                pageWidth={computedWidth / 2}
                                viewUpdateHandler={viewUpdateHandler}
                            />
                        </Col>
                        <Col md={6} id={`${c}-${nextComp.id}`}>
                            <VisualizationComponent 
                                key={nextComp.id} 
                                adminMode={adminMode}
                                clickHandler={this.handleComponentClick.bind(null, i+1)} 
                                datasets={datasets}
                                isSelected={checkSelected && selectedComponentIndex === i+1}
                                model={nextComp}
                                pageWidth={computedWidth / 2}
                                viewUpdateHandler={viewUpdateHandler}
                            />
                        </Col>
                    </Row>
                );
                i += 2;

            /**
             * Else add just this component into a row
             */
            } else {
                comps.push(
                    <Row key={comp.id}> 
                        <Col md={12} id={`${c}-${comp.id}`}>
                            <VisualizationComponent 
                                key={comp.id} 
                                adminMode={adminMode}
                                clickHandler={this.handleComponentClick.bind(null, i)} 
                                datasets={datasets}
                                isSelected={checkSelected && selectedComponentIndex === i}
                                model={comp}
                                pageWidth={computedWidth}
                                viewUpdateHandler={viewUpdateHandler}
                            />
                        </Col>
                    </Row>
                );
                i++;
            }
        }
        return comps;
    }

    private handleComponentClick = (compIdx: number) => {
        const { componentClickHandler } = this.props;
        if (componentClickHandler) {
            componentClickHandler(compIdx);
        }
    }
}