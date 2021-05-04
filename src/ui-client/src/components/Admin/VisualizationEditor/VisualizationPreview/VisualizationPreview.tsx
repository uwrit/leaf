/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { VegaLite, VisualizationSpec } from 'react-vega';
import { Col, Row } from 'reactstrap';
import { AdminVisualizationState } from '../../../../models/state/AdminState';

interface Props { 
    data: AdminVisualizationState;
    dispatch: any;
}

export default class VisualizationPreview extends React.PureComponent<Props> {
    private className = 'visualization-preview';

    public render() {
        const c = this.className;
        const { data, dispatch } = this.props;
        const { changed, datasets, currentPage } = data;

        if (!currentPage) return null;
        
        return (
            <div className={c}>
                {currentPage.components.map(comp => {
                    const colWidth = comp.isFullWidth ? 12 : 6;
                    const spec = comp.jsonSpec as VisualizationSpec;
                    const data: any = {};

                    for (const dsid of comp.datasetQueryIds) {
                        data[dsid] = [];
                    }

                    return (
                        <Row>
                            <Col md={colWidth}>
                                <div className={c}>
                                    <VegaLite spec={spec} data={data}/>
                                </div>
                            </Col>
                        </Row>
                    );
                })}
            </div>
        );
    }
}