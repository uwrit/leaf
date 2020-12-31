/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { createPortal } from 'react-dom';
import { Col, Row } from 'reactstrap';
import { connect } from 'react-redux';
import { AppState } from '../../../models/state/AppState';
import { Panel as PanelModel } from '../../../models/panel/Panel';
import Panel from '../../FindPatients/Panels/Panel';
import { CohortStateType } from '../../../models/state/CohortState';
import { FiSlash } from 'react-icons/fi';
import './PanelSelectorModal.css';

interface OwnProps {
    headerText: string;
    handleByPanelSelect: (panelIndex?: number) => void;
    toggle: () => void;
}
interface StateProps {
    panels: PanelModel[];
}
interface DispatchProps {
    dispatch: (f: any) => void;
}
type Props = StateProps & OwnProps & DispatchProps;

enum PanelType {
    Valid = 1,
    Excluded = 2,
    NoEncounters = 3,
    Empty = 4
}

interface State {
    shown: boolean;
}

class PanelSelectorModal extends React.PureComponent<Props, State> {
    private className = 'panel-selector';
    private mouseOut = true;

    public constructor(props: Props) {
        super(props);
        this.state = { 
            shown: false
        }
    }

    public componentDidMount() {
        this.setFocus();
        setTimeout(() => this.setState({ shown: true }), 10)
    }
    
    public render() {
        const { panels, headerText, toggle } = this.props;
        const c = this.className;
        const modalClasses = [ `${c}-modal`, (this.state.shown ? 'shown' : '') ];

        return (
            createPortal(
                <div className={modalClasses.join(' ')}
                    onBlur={this.handleBlur} 
                    onMouseLeave={this.handleMouseLeave} 
                    onMouseEnter={this.handleMouseEnter} 
                    ref={this.triggerClick}>
                    <div className={`${c}-container`}>
                        <span className={`${c}-close`} onClick={toggle}>✖</span>
                        <div className={`${c}-header`}>{headerText}</div>
                        <Row>
                            {panels.map((p,i) => {
                                const tp = this.getPanelType(p);
                                return (
                                    <Col className={`${c}-panel-wrapper ${this.getPanelClass(tp)}`} md={4} key={i}>
                                        {this.getPanelExclusionText(tp)}
                                        <div className={`${c}-panel-id`}>Panel {i+1}</div>
                                        <div className={`${c}-panel-overlay`} onClick={this.handlePanelSelect.bind(null, p, i)}>
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
                    </div>
                </div>
            , document.body)
        )
    }

    private handlePanelSelect = (panel: PanelModel, panelIndex: number) => {
        const { handleByPanelSelect } = this.props;

        if (this.getPanelType(panel) === PanelType.Valid) {
            handleByPanelSelect(panelIndex);
        }
    }

    private noOp = () => () => null;

    private getPanelExclusionText = (tp: PanelType) => {
        if (tp === PanelType.Valid) { return null; }

        let text = '';
        if (tp === PanelType.Empty)        { text = 'Panel has no Leaf concepts'; }
        if (tp === PanelType.NoEncounters) { text = 'Panel has no associated encounters or dates'; }
        if (tp === PanelType.Excluded)     { text = 'Panel is excluded'; }
        return <div className={`${this.className}-exclusion-text`}><FiSlash/>{text}</div>
    }

    private getPanelClass = (tp: PanelType): string => {
        if (tp === PanelType.Empty)        { return 'empty'; }
        if (tp === PanelType.NoEncounters) { return 'no-encounters'; }
        if (tp === PanelType.Excluded)     { return 'excluded'; }
        return 'valid';
    }

    private getPanelType = (panel: PanelModel): PanelType => {
        const noEncs = !panel.subPanels.find(sp => sp.panelItems.find(pi => pi.concept.isEncounterBased));
        const excluded = !panel.includePanel;
        const empty = !panel.subPanels.find(sp => sp.panelItems.length > 0);

        if (empty)    { return PanelType.Empty; }
        if (excluded) { return PanelType.Excluded; }
        if (noEncs)   { return PanelType.NoEncounters; }
        return PanelType.Valid;
    }

    private handleMouseEnter = () => this.mouseOut = false;

    private handleMouseLeave = () => this.mouseOut = true;

    private handleBlur = (e: React.SyntheticEvent<Element>) => {
        const { handleByPanelSelect, toggle } = this.props;
        if (this.mouseOut) { 
            handleByPanelSelect()
            toggle(); 
        }
    }

    private triggerClick = (el: any) => {
        if (el) { el.click(); }
    }

    private setFocus = () => {
        const elem: any = document.getElementsByClassName(this.className);
        if (elem[0] && elem[0].focus) {
            elem[0].focus();
        }
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
    (mapStateToProps, mapDispatchToProps)(PanelSelectorModal)