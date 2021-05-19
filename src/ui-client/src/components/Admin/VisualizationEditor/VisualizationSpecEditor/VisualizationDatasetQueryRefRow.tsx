/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Tooltip } from 'reactstrap';
import { AdminVisualizationDatasetState } from '../../../../models/state/AdminState';
import { VisualizationDatasetQueryRef } from '../../../../models/visualization/Visualization';
import VisualizationDatasetSample from './VisualizationDatasetSample';

interface Props { 
    metadata: VisualizationDatasetQueryRef;
    dataset?: AdminVisualizationDatasetState;
}

interface State {
    showSample: boolean;
}

export default class VisualizationDatasetQueryRefRow extends React.PureComponent<Props, State> {
    private className = 'visualization-spec-editor-datasetqueryref';

    public constructor(props: Props) {
        super(props);
        this.state = {
            showSample: false
        }
    }

    public render() {
        const c = this.className;
        const { dataset, metadata } = this.props;
        const { showSample } = this.state;
        const tooltipId = `${c}-tooltip-${dataset.id}`;

        if (!dataset) return null;

        return (
            <div key={dataset.id} className={c}>
                <div className={`${c}-name`}>{metadata.name}</div>
                <div id={tooltipId} className={`visualization-spec-editor-sample-size`}>{dataset.data.length.toLocaleString()} rows, hover to view sample</div>
                <Tooltip className={`visualization-spec-editor-sample-tooltip`} 
                    placement="bottom" 
                    isOpen={showSample} 
                    autohide={false} 
                    target={tooltipId}
                    toggle={this.handleShowSampleClick}
                    >
                    <VisualizationDatasetSample data={dataset.data}/>
                </Tooltip>
                <div className={`${c}-delete`}>Delete</div>
            </div>
        );
    }

    private handleShowSampleClick = () => {
        this.setState({ showSample: !this.state.showSample });
    }
}