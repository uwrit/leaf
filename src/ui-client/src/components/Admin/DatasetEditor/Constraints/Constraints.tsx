/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { ConstraintType, Constraint as ConstraintModel } from '../../../../models/admin/Concept';
import { Section } from '../../ConceptEditor/Sections/Section';
import { DatasetQueryConstraint, AdminDatasetQuery } from '../../../../models/admin/Dataset';
import { Constraint } from '../../ConceptEditor/Sections/Constraint';

interface Props {
    changeHandler: (constraints: DatasetQueryConstraint[], propName: string) => any;
    dataset: AdminDatasetQuery;
}

export class Constraints extends React.PureComponent<Props> {
    private className = 'concept-editor';
    private propName = 'constraints';
    constructor(props: Props) {
        super(props);
    }

    public render() {
        const { dataset } = this.props;
        const c = this.className;

        return (
            <Section header='Access Restrictions'>
                <div className={`${c}-constraints`}>
                    <p>Restrict access to this Dataset by specific users or groups</p>
                    <div className={`${c}-constraints-container`}>
                        {dataset.constraints.map((constraint, i) => 
                            <Constraint 
                                constraint={constraint} index={i} key={i}
                                changeHandler={this.handleConstraintChange} deleteHandler={this.handleConstraintDelete} 
                            />
                        )}
                        {dataset.constraints.length === 0 &&
                            <div className={`${c}-constraints-none`}>No restrictions - all users can see this Dataset</div>
                        }
                    </div>
                </div>
                <div className={`${c}-constraints-addnew`} onClick={this.handleAddNewClick}>+ Add New Restriction</div>
            </Section>
        );
    }

    private handleConstraintDelete = (idx: number) => {
        const { changeHandler, dataset } = this.props;
        const constraints = dataset.constraints.slice();
        constraints.splice(idx, 1);
        changeHandler(constraints, this.propName);
    }

    private handleConstraintChange = (idx: number, newConstraint: ConstraintModel) => {
        const { changeHandler, dataset } = this.props;
        const constraints = dataset.constraints.slice();
        constraints.splice(idx, 1, (newConstraint as DatasetQueryConstraint));
        changeHandler(constraints, this.propName);
    }

    private handleAddNewClick = () => {
        const { changeHandler, dataset } = this.props;
        const newConstraint: DatasetQueryConstraint = { datasetQueryId: dataset.id, constraintId: ConstraintType.User, constraintValue: '' };
        const constraints = dataset.constraints.slice();
        constraints.push(newConstraint);
        changeHandler(constraints, this.propName);
    }
};
