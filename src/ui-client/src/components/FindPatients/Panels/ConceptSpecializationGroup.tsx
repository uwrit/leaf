/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
import { ConceptSpecialization, ConceptSpecializationGroup as ConceptSpecializationGroupModel } from '../../../models/concept/Concept';
import { PanelItem as PanelItemModel } from '../../../models/panel/PanelItem';
import { PanelHandlers } from './PanelGroup';

interface State {
    dropdownOpen: boolean;
}

interface Props {
    handlers: PanelHandlers;
    panelItem: PanelItemModel;
    selected: ConceptSpecialization[];
    specializationGroup: ConceptSpecializationGroupModel;
}

export default class ConceptSpecializationGroup extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { dropdownOpen: false };
    }

    public render() {
        const { selected, specializationGroup } = this.props;
        const c = 'panel-item-specialization';
        const specializationSelected = selected.find((s) => s.specializationGroupId === specializationGroup.id);
        const display = specializationSelected
            ? specializationSelected.uiDisplayText
            : specializationGroup.uiDefaultText;

        return (
            <Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggle} className={`${c}-dropdown`}>
                <DropdownToggle 
                    caret={false}
                    className={`${c}-text`}> 
                    {display}
                </DropdownToggle>
                <DropdownMenu>
                    <DropdownItem 
                        className={`${c}-dropdown-option leaf-dropdown-item ${!specializationSelected ? 'selected' : ''}`}
                        onClick={this.handleDefaultClick}>
                        {specializationGroup.uiDefaultText}
                    </DropdownItem>
                    <DropdownItem divider={true} />
                    {specializationGroup.specializations.map((s: ConceptSpecialization) => (
                        <DropdownItem 
                            key={s.id} 
                            onClick={this.handleSpecializationClick.bind(null, s)}
                            className={`${c}-dropdown-item leaf-dropdown-item ${s === specializationSelected ? 'selected' : ''}`}>
                            {s.uiDisplayText}
                        </DropdownItem>
                    ))}
                </DropdownMenu>
            </Dropdown>
        );
    }

    private toggle = () => {
        this.setState({ dropdownOpen: !this.state.dropdownOpen });
    }

    private handleDefaultClick = () => {
        const { specializationGroup, panelItem, handlers } = this.props;
        handlers.handleDeselectSpecialization(panelItem, specializationGroup);
    }

    private handleSpecializationClick = (conceptSpecialization: ConceptSpecialization) => {
        const { panelItem, handlers } = this.props;
        handlers.handleSelectSpecialization(panelItem, conceptSpecialization);
    }
}

