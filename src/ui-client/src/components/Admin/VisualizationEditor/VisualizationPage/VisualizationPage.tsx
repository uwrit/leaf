/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { VegaLite, VisualizationSpec } from 'react-vega';
import { Col, Row } from 'reactstrap';
import { VisualizationPage as VisualizationPageModel, VisualizationComponent as VisualizationComponentModel } from '../../../../models/visualization/Visualization';
import { VisualizationComponent } from './VisualizationComponent';
import './VisualizationPage.css';

interface Props {
    adminMode?: boolean;
    currentComponent?: VisualizationComponentModel;
    componentClickHandler: (comp: VisualizationComponentModel) => any;
    page: VisualizationPageModel;
    dispatch: any;
}

export default class VisualizationPage extends React.PureComponent<Props> {
    private className = 'visualization-page';

    public render() {
        const c = this.className;
        const { page, adminMode, currentComponent, componentClickHandler } = this.props;


        return (
            <div className={c}>
                {page.components.map(comp => {
                    return (
                        <VisualizationComponent 
                            key={comp.id} 
                            adminMode={adminMode}
                            clickHandler={componentClickHandler} 
                            data={comp}
                            isSelected={adminMode && currentComponent && currentComponent === comp}
                        />
                    )})
                }
            </div>);
        
    }
}