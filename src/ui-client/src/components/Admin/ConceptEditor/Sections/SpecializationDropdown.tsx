/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { ConceptSpecialization, ConceptSpecializationGroup } from '../../../../models/concept/Concept';

interface Props {
    specializationGroup: ConceptSpecializationGroup;
}

export class SpecializationDropdown extends React.PureComponent<Props> {
    private className = "concept-editor"
    public render() {
        const c = this.className;
        const grp = this.props.specializationGroup;
        const spcs: ConceptSpecialization[] = [];
        grp.specializations.forEach((s) => spcs.push(s));

        return (
            <div className={`${c}-concept-specialization-dropdown-container`}>
                <div className={`${c}-concept-specialization-dropdown-preview`}>
                    <div className={`${c}-concept-specialization-dropdown-default`}>
                        {grp.uiDefaultText}
                    </div>
                    {spcs.map((s) => 
                        <div key={s.id} className={`${c}-concept-specialization-dropdown-item`}>{s.uiDisplayText}</div>
                    )}
                </div>
            </div>
        );
    }
};
