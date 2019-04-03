/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Section } from './Section';
import { Input } from './Input';
import { SectionProps } from '../Props';
import { TextArea } from './TextArea';

interface Props {
    data: SectionProps;
}

export class Identifiers extends React.PureComponent<Props> {
    constructor(props: Props) {
        super(props);
    }

    public render() {
        const { changeHandler, adminConcept } = this.props.data;
        return (
            <Section header='Identifiers'>
                <Input 
                    changeHandler={changeHandler} propName={'id'} value={adminConcept!.id} locked={true}
                    label='Concept Id' subLabel='Id for the Concept. This is used internally by Leaf and cannot be edited directly.'
                />
                <Input 
                    changeHandler={changeHandler} propName={'parentId'} value={adminConcept!.parentId} locked={true}
                    label='Parent Id' subLabel='Id for the parent Concept that appears above this in the tree. Edit by dragging Concept into a new parent.'
                />
                <Input 
                    changeHandler={changeHandler} propName={'rootId'} value={adminConcept!.rootId} locked={true}
                    label='Root Id' subLabel='Root (top-most) ancestor Id for the Concept.'
                />
                <TextArea
                    changeHandler={changeHandler} propName={'universalId'} value={adminConcept!.universalId} 
                    label='Universal Id' subLabel='Used if Leaf is querying multiple instances. This Id must match at all institutions in order for queries to be mapped correctly.'
                />
                <Input 
                    changeHandler={changeHandler} propName={'externalId'} value={adminConcept!.externalId}
                    label='External Id' subLabel='Optional Id used if this Concept is updated by automated scripts, etc. Not used by Leaf itself.'
                />
                <Input 
                    changeHandler={changeHandler} propName={'externalParentId'} value={adminConcept!.externalParentId!} 
                    label='External Parent Id'
                />
            </Section>
        );
    }
};
