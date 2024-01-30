/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Row } from 'reactstrap';
import { Concept, ConceptSpecialization, ConceptSpecializationGroup } from '../../../models/concept/Concept';
import { DateBoundary } from '../../../models/panel/Date';
import { Panel as PanelModel } from '../../../models/panel/Panel';
import { PanelItem } from '../../../models/panel/PanelItem';
import { SubPanel, SubPanelJoinSequence } from '../../../models/panel/SubPanel';
import { CohortStateType } from '../../../models/state/CohortState';
import Panel from './Panel';
import { NumericFilter } from '../../../models/panel/NumericFilter';
import { DbQueryMode } from '../../../models/Auth';
import { 
    deselectSpecialization, setPanelDateFilter, setPanelInclusion, setSubPanelCount, 
    setSubPanelInclusion, selectSpecialization, addPanelItem, setPanelItemNumericFilter, hidePanelItem, removePanelItem, setSubPanelJoinSequence
} from '../../../actions/panels';

interface Props {
    dispatch: any;
    mode: DbQueryMode;
    panels: PanelModel[];
    queryState: CohortStateType;
}

export interface PanelHandlers {
    handlePanelInclusion: (panelIndex: number, include: boolean) => void;
    handleSubPanelInclusion: (panelIndex: number, subpanelIndex: number, include: boolean) => void;
    handlePanelDateFilter: (panelIndex: number, dateFilter: DateBoundary) => void;
    handleSubPanelCount: (panelIndex: number, subpanelIndex: number, minCount: number) => void;
    handleDeselectSpecialization: (panelItem: PanelItem, conceptSpecializationGroup: ConceptSpecializationGroup) => void;
    handleSelectSpecialization: (panelItem: PanelItem, conceptSpecialization: ConceptSpecialization) => void;
    handleAddPanelItem: (concept: Concept, subPanel: SubPanel) => void;
    handlePanelItemNumericFilter: (panelItem: PanelItem, filter: NumericFilter) => void;
    handleHidePanelItem: (panelItem: PanelItem) => void;
    handleRemovePanelItem: (panelItem: PanelItem) => void;
    handleSubPanelJoinSequence: (subPanel: SubPanel, joinSequence: SubPanelJoinSequence) => void;
}

export class PanelGroup extends React.PureComponent<Props> {
    public render() {
        const { panels, queryState } = this.props;
        const handlers = this.packageHandlers();

        return (
            <Row>
                {panels.map((panel: PanelModel, i: number) =>
                    <Panel 
                        maybeHandlers={handlers}
                        key={panel.id} 
                        isFirst={i === 0}
                        panel={panel}
                        queryState={queryState}
                    />
                )}
            </Row>
        );
    }

    private packageHandlers = () => {
        return {
            handlePanelInclusion: this.handlePanelInclusion,
            handleSubPanelInclusion: this.handleSubPanelInclusion,
            handlePanelDateFilter: this.handlePanelDateFilter,
            handleSubPanelCount: this.handleSubPanelCount,
            handleDeselectSpecialization: this.handleDeselectSpecialization,
            handleSelectSpecialization: this.handleSelectSpecialization,
            handleAddPanelItem: this.handleAddPanelItem,
            handlePanelItemNumericFilter: this.handlePanelItemNumericFilter,
            handleHidePanelItem: this.handleHidePanelItem,
            handleRemovePanelItem: this.handleRemovePanelItem,
            handleSubPanelJoinSequence: this.handleSubPanelJoinSequence
        };
    }

    private handlePanelInclusion = (panelIndex: number, include: boolean) => {
        const { dispatch } = this.props;
        dispatch(setPanelInclusion(panelIndex, include));
    }

    private handleSubPanelInclusion = (panelIndex: number, subpanelIndex: number, include: boolean) => {
        const { dispatch } = this.props;
        dispatch(setSubPanelInclusion(panelIndex, subpanelIndex, include));
    }

    private handlePanelDateFilter = (panelIndex: number, dateFilter: DateBoundary) => {
        const { dispatch } = this.props;
        dispatch(setPanelDateFilter(panelIndex, dateFilter));
    }

    private handleSubPanelCount = (panelIndex: number, subpanelIndex: number, minCount: number) => {
        const { dispatch } = this.props;
        dispatch(setSubPanelCount(panelIndex, subpanelIndex, minCount));
    }

    private handleDeselectSpecialization = (panelItem: PanelItem, conceptSpecializationGroup: ConceptSpecializationGroup) => {
        const { dispatch } = this.props;
        dispatch(deselectSpecialization(panelItem.concept, panelItem.panelIndex, panelItem.subPanelIndex, panelItem.index, conceptSpecializationGroup));
    }

    private handleSelectSpecialization = (panelItem: PanelItem, conceptSpecialization: ConceptSpecialization) => {
        const { dispatch } = this.props;
        dispatch(selectSpecialization(panelItem.concept, panelItem.panelIndex, panelItem.subPanelIndex, panelItem.index, conceptSpecialization));
    }

    private handleAddPanelItem = (concept: Concept, subPanel: SubPanel) => {
        const { dispatch, mode } = this.props;
        dispatch(addPanelItem(concept, subPanel.panelIndex, subPanel.index, mode));
    }

    private handlePanelItemNumericFilter = (panelItem: PanelItem, filter: NumericFilter) => {
        const { dispatch } = this.props;
        const pi = panelItem;
        dispatch(setPanelItemNumericFilter(pi.concept, pi.panelIndex, pi.subPanelIndex, pi.index, filter));
    }

    private handleHidePanelItem = (panelItem: PanelItem) => {
        const { dispatch } = this.props;
        dispatch(hidePanelItem(panelItem.concept, panelItem.panelIndex, panelItem.subPanelIndex, panelItem.index));
    }

    private handleRemovePanelItem = (panelItem: PanelItem) => {
        const { dispatch, mode } = this.props;
        dispatch(removePanelItem(panelItem.concept, panelItem.panelIndex, panelItem.subPanelIndex, panelItem.index, mode));
    }

    private handleSubPanelJoinSequence = (subPanel: SubPanel, joinSequence: SubPanelJoinSequence) => {
        const { dispatch } = this.props;
        dispatch(setSubPanelJoinSequence(subPanel.panelIndex, subPanel.index, { ...subPanel.joinSequence, ...joinSequence }));
    }
}
