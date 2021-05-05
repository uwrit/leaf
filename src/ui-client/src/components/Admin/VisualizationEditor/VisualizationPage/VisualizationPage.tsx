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
import { VisualizationComponent } from './VisualizationComponent';

interface Props { 
    data: AdminVisualizationState;
    dispatch: any;
    spec: VisualizationSpec;
}

export default class VisualizationPage extends React.PureComponent<Props> {
    private className = 'visualization-page';

    public render() {
        const c = this.className;
        const { data, dispatch, spec } = this.props;
        const { changed, datasets, currentPage } = data;

        if (!currentPage) return null;

        const d = { "values": [
            {"a": "A", "b": 28}, {"a": "B", "b": 55}, {"a": "C", "b": 43},
            {"a": "D", "b": 91}, {"a": "E", "b": 81}, {"a": "F", "b": 53},
            {"a": "G", "b": 19}, {"a": "H", "b": 87}, {"a": "I", "b": 52}
            ]
        }
        
        return (
            <div className={c}>
                {currentPage.components.map(comp => <VisualizationComponent data={comp} />)}
            </div>
        );
    }
}