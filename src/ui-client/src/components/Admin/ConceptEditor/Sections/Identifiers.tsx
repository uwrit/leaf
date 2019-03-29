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

interface Props {
    data: SectionProps;
}

export class Identifiers extends React.PureComponent<Props> {
    constructor(props: Props) {
        super(props);
    }

    public render() {
        const { changeHandler, concept } = this.props.data;
        return (
            <Section header='Identifiers'>
                <Input 
                    changeHandler={changeHandler} propName={'id'} value={concept!.id} locked={true}
                    label='Concept Id' subLabel='Id for the Concept. This is used internally by Leaf and cannot be edited directly.'
                />
                <Input 
                    changeHandler={changeHandler} propName={'parentId'} value={concept!.parentId} 
                    label='Parent Id' subLabel='Id for the parent Concept that appears above this in the tree. Edit with caution.'
                />
                <Input 
                    changeHandler={changeHandler} propName={'universalId'} value={concept!.universalId} 
                    label='Universal Id' subLabel='Used if Leaf is querying multiple instances. This Id must match at all institutions in order for queries to be mapped correctly.'
                />
                <Input 
                    changeHandler={changeHandler} propName={'externalId'} value={concept!.externalId}
                    label='External Id' subLabel='Optional Id used if this Concept is updated by automated scripts, etc. Not used by Leaf itself.'
                />
                <Input 
                    changeHandler={changeHandler} propName={'externalParentId'} value={concept!.externalParentId!} 
                    label='External Parent Id'
                />
            </Section>
        );
    }
};
