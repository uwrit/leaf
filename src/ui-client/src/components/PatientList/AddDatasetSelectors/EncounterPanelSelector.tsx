/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Col, Row, Button } from 'reactstrap';
import { connect } from 'react-redux';
import { AppState } from '../../../models/state/AppState';
import { Panel as PanelModel } from '../../../models/panel/Panel';
import Panel from '../../FindPatients/Panels/Panel';
import { CohortStateType } from '../../../models/state/CohortState';
import './EncounterPanelSelector.css';

interface OwnProps {
    handleByEncounterSelect: () => void;
}
interface StateProps {
    panels: PanelModel[];
}
interface DispatchProps {
    dispatch: (f: any) => void;
}
type Props = StateProps & OwnProps & DispatchProps;

class EncounterPanelSelector extends React.PureComponent<Props> {
    private className = 'encounter-panel-selector';

    public render() {
        const { handleByEncounterSelect, panels } = this.props;
        const c = this.className;
        return (
            <div className={`${c}-container`}>
                {panels.map((p,i) => {
                    return (
                        <Panel 
                            isFirst={i===0}
                            dispatch={this.noOp}
                            panel={p}
                            queryState={CohortStateType.LOADED}
                        />
                    )
                })}
            </div>
        )
    }

    private noOp = () => () => null;
}

const mapStateToProps = (state: AppState, ownProps: OwnProps): StateProps => {
    return { 
        panels: state.panels
    };
};

const mapDispatchToProps = (dispatch: any, ownProps: OwnProps) : DispatchProps => {
    return { dispatch };
}

export default connect<StateProps, DispatchProps, OwnProps, AppState>
    (mapStateToProps, mapDispatchToProps)(EncounterPanelSelector)