/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { createPortal } from 'react-dom';
import { Col, Row, Button, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { connect } from 'react-redux';
import { AppState } from '../../../models/state/AppState';
import { Panel as PanelModel } from '../../../models/panel/Panel';
import Panel from '../../FindPatients/Panels/Panel';
import { CohortStateType } from '../../../models/state/CohortState';
import { PatientListDatasetQuery } from '../../../models/patientList/Dataset';
import PopupBox from '../../Other/PopupBox/PopupBox';
import './EncounterPanelSelector.css';

interface OwnProps {
    dataset?: PatientListDatasetQuery;
    handleByEncounterSelect: (panelIndex: number) => void;
    isOpen: boolean;
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
        const { panels, dataset, isOpen, handleByEncounterSelect } = this.props;
        const c = this.className;
        const modalClasses = [ `${c}-modal` ];

        // if (!isOpen) { return null; }

        return (
            createPortal(
                <div className={modalClasses.join(' ')}>
                    <div className={`${c}-container`}>
                        <ModalBody>
                            <div className={`${c}-header`}>Which Encounters do you want {dataset && dataset.name} data from?</div>
                            <Row>
                                {panels.map((p,i) => {
                                    return (
                                        <Col className={`${c}-panel-wrapper ${this.getPanelClass(p)}`} md={4}>
                                            <div className={`${c}-panel-id`}>Panel {i+1}</div>
                                            <div className={`${c}-panel-overlay`} onClick={handleByEncounterSelect.bind(null, i)}>
                                                <Panel 
                                                    isFirst={i===0}
                                                    dispatch={this.noOp}
                                                    panel={p}
                                                    queryState={CohortStateType.LOADED}
                                                />
                                            </div>
                                        </Col>
                                    )
                                })}
                            </Row>
                        </ModalBody>
                    </div>
                </div>
            , document.body)
        )
    }

    private noOp = () => () => null;

    private getPanelClass = (panel: PanelModel): string => {
        const hasEncs = !!panel.subPanels.find(sp => sp.panelItems.find(pi => pi.concept.isEncounterBased));
        const negated = !panel.includePanel;
        const empty = !panel.subPanels.find(sp => sp.panelItems.length > 0);

        if (negated)  { return 'excluded'; }
        if (!hasEncs) { return 'no-encounters'; }
        if (empty)    { return 'empty'; }
        return 'valid';
    }
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