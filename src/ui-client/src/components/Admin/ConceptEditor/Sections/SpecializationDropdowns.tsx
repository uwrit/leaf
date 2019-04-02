/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Section } from './Section';
import { SectionProps } from '../Props';
import { SpecializationDropdown } from './SpecializationDropdown';
import { SpecializationDropdownPicker } from './SpecializationDropdownPicker';
import { ConceptSqlSet } from '../../../../models/admin/Concept';
import { ConceptSpecializationGroup, ConceptSpecialization } from '../../../../models/concept/Concept';

interface Props {
    data: SectionProps;
    set?: ConceptSqlSet;
}

export class SpecializationDropdowns extends React.PureComponent<Props> {
    private className = 'concept-editor';
    private propName = 'specializationGroups';
    constructor(props: Props) {
        super(props);
    }

    public render() {
        const { data, set } = this.props;
        const { adminConcept, userConcept } = data;
        const c = this.className;
        const concept = userConcept!;
        const alreadyAdded = new Set();
        const available: ConceptSpecializationGroup[] = [];

        if (set) {
            if (adminConcept!.specializationGroups) {
                alreadyAdded.add(adminConcept!.specializationGroups.map((grp) => grp.specializationGroupId));
            }
            set.specializationGroups.forEach((grp) => {
                if (!alreadyAdded.has(grp.id)) {
                    const spcs: ConceptSpecialization[] = [];
                    grp.specializations.forEach((s) => spcs.push(s));
                    available.push({ ...grp, specializations: spcs });
                }
            });
        }

        return (
            <Section header='Dropdowns'>
                <div className={`${c}-concept-specialization-dropdowns`}>
                    <p>Allow more granular logic without additional child Concepts</p>
                    <small>Dropdowns appear after the user has dragged the Concept into a query</small>
                    <div className={`${c}-concept-specialization-dropdowns-container`}>
                        {concept.specializationGroups &&
                         concept.specializationGroups.map((grp) => 
                            <SpecializationDropdown specializationGroup={grp} key={grp.id}/>
                        )}
                    </div>
                </div>
                {set &&
                <SpecializationDropdownPicker available={available} clickHandler={this.handleAddNewSpecializationGroupClick}/>
                }
            </Section>
        );
    }

    private handleDropdownDelete = (id: number) => {
        const { changeHandler, adminConcept, userConcept } = this.props.data;
        const groups = adminConcept!.specializationGroups.slice();
        groups.filter((grp) => grp.specializationGroupId !== id);
        changeHandler(groups, this.propName);
    }

    private handleAddNewSpecializationGroupClick = (grp: ConceptSpecializationGroup) => {
        const { changeHandler, adminConcept, userConcept } = this.props.data;
        const groups = adminConcept!.specializationGroups.slice();
        groups.push({ specializationGroupId: grp.id, orderId: grp.orderId });
        changeHandler(groups, this.propName);
    }
};
