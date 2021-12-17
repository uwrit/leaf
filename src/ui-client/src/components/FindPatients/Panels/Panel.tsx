/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Col } from 'reactstrap';
import { Panel as PanelModel } from '../../../models/panel/Panel';
import { SubPanel as SubPanelModel } from '../../../models/panel/SubPanel';
import PanelHeader from './PanelHeader';
import { DateBoundary, DateIncrementType } from '../../../models/panel/Date';
import { CohortStateType } from '../../../models/state/CohortState';
import { PanelHandlers } from './PanelGroup';
import { PanelItem } from '../../../models/panel/PanelItem';
import { Concept, ConceptSpecialization, ConceptSpecializationGroup } from '../../../models/concept/Concept';
import { SubPanelJoinSequence } from '../../../models/panel/SubPanel';
import { NumericFilter } from '../../../models/panel/NumericFilter';
import SubPanel from './SubPanel';
import './Panel.css';

export interface Props {
    maybeHandlers?: PanelHandlers;
    isFirst: boolean;
    panel: PanelModel,
    queryState: CohortStateType;
}

export default class Panel extends React.PureComponent<Props> {
    public render() {
        const { isFirst, panel, queryState, maybeHandlers } = this.props;
        const isDateFiltered = 
            panel.dateFilter.end.dateIncrementType !== DateIncrementType.NONE && 
            panel.dateFilter.start.dateIncrementType !== DateIncrementType.NONE;
        let isCountFiltered = false;
        let hasPanelItems = false;
        let hasSequentialJoin = false;

        for (const subPanel of panel.subPanels) {
            if (subPanel.panelItems.filter((pi) => !pi.hidden).length) { hasPanelItems = true; }
            if (subPanel.index > 0 && subPanel.panelItems.length)      { hasSequentialJoin = true; }
            if (subPanel.minimumCount > 1)                             { isCountFiltered = true; }
        }

        // Set classes
        const classes = [ 'panel', (hasPanelItems ? 'has-data' : 'no-data') ];
        if (!panel.includePanel) { classes.push('panel-excluded'); }
        if (isDateFiltered)      { classes.push('panel-date-filtered'); }
        if (hasSequentialJoin)   { classes.push('panel-sequential-join'); }
        if (isCountFiltered)     { classes.push('panel-count-filtered'); }

        // If no handlers provided, default to no-op
        const handlers = maybeHandlers 
            ? maybeHandlers 
            : this.packageNoOpHandlers();

        return (
            <Col className="panel-column" md={4}>
                <div className={classes.join(' ')}>
                    <PanelHeader 
                        handlers={handlers}
                        isFirst={isFirst} 
                        panel={panel} 
                    />
                    {panel.subPanels.map((subpanel,i) => (
                        <SubPanel 
                            handlers={handlers}
                            key={subpanel.id}
                            index={i}
                            panel={this.props.panel}
                            subPanel={subpanel}
                            queryState={queryState}
                        />
                    ))}
                </div>
            </Col>
        );
    }

    private packageNoOpHandlers = () => {
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

    private handlePanelInclusion = (panelIndex: number, include: boolean) => null as any;
    private handleSubPanelInclusion = (panelIndex: number, subpanelIndex: number, include: boolean) => null as any;
    private handlePanelDateFilter = (panelIndex: number, dateFilter: DateBoundary) => null as any;
    private handleSubPanelCount = (panelIndex: number, subpanelIndex: number, minCount: number) => null as any;
    private handleDeselectSpecialization = (panelItem: PanelItem, conceptSpecializationGroup: ConceptSpecializationGroup) => null as any;
    private handleSelectSpecialization = (panelItem: PanelItem, conceptSpecialization: ConceptSpecialization) => null as any;
    private handleAddPanelItem = (concept: Concept, subPanel: SubPanelModel) => null as any;
    private handlePanelItemNumericFilter = (panelItem: PanelItem, filter: NumericFilter) => null as any;
    private handleHidePanelItem = (panelItem: PanelItem) => null as any;
    private handleRemovePanelItem = (panelItem: PanelItem) => null as any;
    private handleSubPanelJoinSequence = (subPanel: SubPanelModel, joinSequence: SubPanelJoinSequence) => null as any;
}
