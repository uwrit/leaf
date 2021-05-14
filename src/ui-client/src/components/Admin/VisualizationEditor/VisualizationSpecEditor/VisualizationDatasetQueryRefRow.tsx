/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
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

        if (!dataset) return null;

        return (
            <div key={dataset.id} className={c}>
                <div className={`${c}-name`}>{metadata.name}</div>
                <div className={`${c}-show-sample ${showSample ? 'shown' : ''}`} onClick={this.handleShowSampleClick}>{showSample ? 'Hide' : 'Show'} Data Sample</div>
                <div className={`${c}-delete`}>Delete</div>
                {dataset && <VisualizationDatasetSample data={dataset.data} shown={showSample}/>}
            </div>
        );
    }

    private handleShowSampleClick = () => {
        this.setState({ showSample: !this.state.showSample });
    }
}