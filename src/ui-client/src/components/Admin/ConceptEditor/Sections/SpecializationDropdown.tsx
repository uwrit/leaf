/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import {  ConceptSpecializationGroup } from '../../../../models/concept/Concept';

interface Props {
    clickHandler: (grp: ConceptSpecializationGroup, enabled: boolean) => any;
    enabled: boolean;
    specializationGroup: ConceptSpecializationGroup;
}

export class SpecializationDropdown extends React.PureComponent<Props> {
    private className = "concept-editor"
    public render() {
        const c = this.className;
        const { specializationGroup, enabled } = this.props;

        return (
            <div className={`${c}-concept-specialization-dropdown-container ${enabled ? 'enabled' : ''}`}>
                <div className={`${c}-concept-specialization-dropdown-preview`} onClick={this.handleClick}>
                    <div className={`${c}-concept-specialization-dropdown-default`}>
                        {specializationGroup.uiDefaultText}
                    </div>
                    {specializationGroup.specializations.map((s) => 
                        <div key={s.id} className={`${c}-concept-specialization-dropdown-item`}>{s.uiDisplayText}</div>
                    )}
                </div>
            </div>
        );
    }

    private handleClick = () => {
        const { clickHandler, enabled, specializationGroup } = this.props;
        clickHandler(specializationGroup, !enabled);
    }
};
