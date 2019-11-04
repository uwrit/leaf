/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Container, Col, Row } from 'reactstrap';
import { ConnectDropTarget, DropTarget, DropTargetConnector, DropTargetMonitor } from 'react-dnd'
import { PanelFilter } from '../../../../models/admin/PanelFilter';
import { TextArea } from '../../Section/TextArea';
import { setAdminPanelFilter, removeAdminPanelFilter, deleteAdminPanelFilter } from '../../../../actions/admin/panelFilter';
import { Checkbox } from '../../Section/Checkbox';
import { Concept } from '../../../../models/admin/Concept';
import { isNonstandard } from '../../../../utils/panelUtils';
import { ConfirmationModalState } from '../../../../models/state/GeneralUiState';
import { showConfirmationModal } from '../../../../actions/generalUi';

interface DndProps {
    canDrop?: boolean;
    isOver?: boolean;
    connectDropTarget?: ConnectDropTarget;
}

interface OwnProps { 
    dispatch: any;
    concept?: Concept;
    forceValidation: boolean;
    panelFilter: PanelFilter;
    togglePreview: (show: boolean, selectedFilterId: number) => any;
}

type Props = DndProps & OwnProps;

const panelTarget = {
    drop(props: Props, monitor: DropTargetMonitor) {
        const { dispatch, panelFilter } = props;
        const concept: Concept = monitor.getItem();
        const newPf = Object.assign({}, panelFilter, { 
            concept, conceptId: 
            concept.id, changed: true,
            uiDisplayText: concept.uiDisplayName,
            uiDisplayDescription: concept.uiDisplayText
        });
        dispatch(setAdminPanelFilter(newPf, true));
    },
    canDrop (props: Props, monitor: DropTargetMonitor) {
        const concept: Concept = monitor.getItem();
        return !isNonstandard(concept.universalId);
    }
}

const collect = (connect: DropTargetConnector, monitor: DropTargetMonitor) => ({
    canDrop: monitor.canDrop(),
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver()
});

class PanelFilterRow extends React.PureComponent<Props> {
    private className = 'panelfilter-editor';

    public render() {
        const { forceValidation, panelFilter, connectDropTarget, isOver, canDrop } = this.props;
        const c = this.className;
        const classes = [ `${c}-panelfilter` ];

        if (isOver && canDrop) { classes.push('can-drop'); }

        return (
            connectDropTarget &&
            connectDropTarget(
                <div>

                    {/* Unsaved indicator */}
                    {(panelFilter.unsaved || panelFilter.changed) &&
                    <div className={`${c}-unsaved`}>unsaved</div>
                    }

                    {/* Delete button */}
                    <div className={`${c}-delete`} onClick={this.handleSqlSetDeleteClick}>Delete</div>

                    {/* Bound Concept info */}
                    <Row className={classes.join(' ')}>
                        <Col md={3}>
                            <div className={`${c}-text`}>Concept</div>
                            {panelFilter.concept && 
                            <div className={`${c}-concept-container`}>
                                <div className={`${c}-conceptname`}>"{panelFilter.concept.uiDisplayName}"</div>
                                <div className={`${c}-conceptid-container`}>
                                    <span className={`${c}-subtext`}>id: </span>
                                    <span className={`${c}-conceptid`}>{panelFilter.conceptId}</span>
                                </div>
                            </div>
                            }
                            {!panelFilter.concept &&
                            <div className={`${c}-noconcept-container`}>
                                <div className={`${c}-noconcept`}>Drag a Concept to bind to this Panel Filter</div>
                            </div>
                            }
                        </Col>
                        <Col md={6}>

                            {/* Display Text */}
                            <TextArea
                                changeHandler={this.handlePanelFilterChange} propName={'uiDisplayText'} value={panelFilter.uiDisplayText} 
                                label='Display Text' required={true} errorText='Enter text to display' forceValidation={forceValidation}
                                focusToggle={this.handlePreviewToggle}
                            />

                            {/* Description */}
                            <TextArea
                                changeHandler={this.handlePanelFilterChange} propName={'uiDisplayDescription'} value={panelFilter.uiDisplayDescription} 
                                label='Description' required={true} errorText='Enter a description' forceValidation={forceValidation}
                                focusToggle={this.handlePreviewToggle}
                            />
                        </Col>

                        {/* Include or Exclude */}
                        <Col md={3}>
                            <Container>
                                <Checkbox 
                                    changeHandler={this.handlePanelFilterChange} propName={'isInclusion'} value={panelFilter.isInclusion} 
                                    label='Is Inclusion'
                                />
                            </Container>
                            <p className={`${c}-subtext`}>
                                If 'true', the panel filter concept will be used as part of the inclusion criteria for the query. If 'false', any 
                                patients found will be excluded instead.
                            </p>
                        </Col>
                    </Row>
                </div>
            ));
    }

    private handlePreviewToggle = (show: boolean) => {
        const { panelFilter, togglePreview } = this.props;
        togglePreview(show, panelFilter.id);
    }

    /*
     * Handle any edits to the Panel Filter, updating 
     * the store and preparing a later API save event.
     */
    private handleSqlSetDeleteClick = () => {
        const { panelFilter, dispatch } = this.props;

        if (panelFilter.unsaved) {
            dispatch(removeAdminPanelFilter(panelFilter));
        } else {
            const confirm: ConfirmationModalState = {
                body: `Are you sure you want to delete the Panel Filter (id "${panelFilter.id}")? This can't be undone.`,
                header: 'Delete Panel Filter',
                onClickNo: () => null,
                onClickYes: () => dispatch(deleteAdminPanelFilter(panelFilter)),
                show: true,
                noButtonText: `No`,
                yesButtonText: `Yes, Delete Panel Filter`
            };
            dispatch(showConfirmationModal(confirm));
        }
    }

    private handlePanelFilterChange = (val: any, propName: string) => {
        const { panelFilter, dispatch } = this.props;
        const newPf = Object.assign({}, panelFilter, { [propName]: val === '' ? null : val, changed: true });
        dispatch(setAdminPanelFilter(newPf, true));
    }
}

export default DropTarget('CONCEPT', panelTarget, collect)(PanelFilterRow) as any;