/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Section } from '../../Section/Section';
import { SectionProps } from '../Props';
import { SpecializationDropdown } from './SpecializationDropdown';
import { ConceptSqlSet } from '../../../../models/admin/Concept';
import { ConceptSpecializationGroup, ConceptSpecialization } from '../../../../models/concept/Concept';
import { setAdminPanelCurrentUserConcept } from '../../../../actions/admin/concept';
import { setConcept } from '../../../../actions/concepts';

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
        const { adminConcept } = data;
        const c = this.className;
        const concept = adminConcept!;
        const hasGroups = !!concept.specializationGroups;
        const grps: ConceptSpecializationGroup[] = [];

        if (set) {
            set.specializationGroups.forEach((grp) => {
                const spcs: ConceptSpecialization[] = [];
                grp.specializations.forEach((s) => spcs.push(s));
                grps.push({ ...grp, specializations: spcs });
            });
        }

        return (
            <Section header='Dropdowns'>
                <div className={`${c}-concept-specialization-dropdowns`}>
                    <p>Allow more granular logic without additional child Concepts</p>
                    <small>Dropdowns appear after the user has dragged the Concept into a query</small>
                    {grps.length > 0 && !adminConcept!.isSpecializable && concept.specializationGroups!.length > 0 &&
                    <div className={`${c}-warning`}>
                        Dropdowns will not be visible as <span className='code'>Allow Dropdowns</span> is false
                    </div>
                    }
                    <div className={`${c}-concept-specialization-dropdowns-container`}>
                        {grps.map((grp) => {
                            const enabled = hasGroups && !!concept.specializationGroups!.find((g) => g.specializationGroupId === grp.id);
                            return <SpecializationDropdown specializationGroup={grp} key={grp.id} enabled={enabled} clickHandler={this.handleDropdownClick}/>
                        })}
                        {grps.length === 0 &&
                        <div className={`${c}-concept-specialization-no-dropdowns`}>No dropdowns available for this SQL Set</div>
                        }
                    </div>
                </div>
            </Section>
        );
    }

    private handleDropdownClick = (selected: ConceptSpecializationGroup, enabled: boolean) => {
        const { changeHandler, adminConcept, userConcept, dispatch } = this.props.data;
        const newAdminConcept = Object.assign({}, adminConcept);
        const newUserConcept = Object.assign({}, userConcept);

        if (!newAdminConcept.specializationGroups) {
            newAdminConcept.specializationGroups = [];
            newUserConcept.specializationGroups = [];
        }
        if (enabled) {
            newAdminConcept.specializationGroups.push({ specializationGroupId: selected.id, orderId: (selected.id ? selected.id : 1) })
            newUserConcept.specializationGroups!.push(selected);
        } else {
            newAdminConcept.specializationGroups = newAdminConcept.specializationGroups.filter((g) => g.specializationGroupId !== selected.id);
            newUserConcept.specializationGroups = newUserConcept.specializationGroups!.filter((g) => g.id !== selected.id);
        }
        changeHandler(newAdminConcept.specializationGroups, this.propName);
        dispatch(setAdminPanelCurrentUserConcept(newUserConcept));
    }
};
