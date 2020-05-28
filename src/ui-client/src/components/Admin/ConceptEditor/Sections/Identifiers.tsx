/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Section } from '../../Section/Section';
import { SectionProps } from '../Props';
import { TextArea } from '../../Section/TextArea';

interface Props {
    data: SectionProps;
}

export class Identifiers extends React.PureComponent<Props> {
    private uidBase = 'urn:leaf:concept:';

    public render() {
        const { changeHandler, adminConcept } = this.props.data;
        const uid = adminConcept && adminConcept.universalId
            ? adminConcept.universalId.replace(this.uidBase,'')
            : '';
        return (
            <Section header='Identifiers'>
                <TextArea 
                    changeHandler={changeHandler} propName={'id'} value={adminConcept!.id} locked={true}
                    label='Concept Id' subLabel='Id for the Concept. This is used internally by Leaf and cannot be edited directly.'
                />
                <TextArea 
                    changeHandler={changeHandler} propName={'parentId'} value={adminConcept!.parentId} locked={true}
                    label='Parent Id' subLabel='Id for the parent Concept that appears above this in the tree. Edit by dragging Concept into a new parent.'
                />
                <TextArea 
                    changeHandler={changeHandler} propName={'rootId'} value={adminConcept!.rootId} locked={true}
                    label='Root Id' subLabel='Root (top-most) ancestor Id for the Concept.'
                />
                <TextArea
                    changeHandler={this.handleUniversalIdChange} propName={'universalId'} value={uid} className={"concept-editor-concept-universalid"}
                    label='Universal Id' subLabel='Used if Leaf is querying multiple instances. This Id must match at all institutions in order for queries to be mapped correctly.'
                />
                <TextArea 
                    changeHandler={changeHandler} propName={'externalId'} value={adminConcept!.externalId}
                    label='External Id' subLabel='Optional Id used if this Concept is updated by automated scripts, etc. Not used by Leaf itself.'
                />
                <TextArea 
                    changeHandler={changeHandler} propName={'externalParentId'} value={adminConcept!.externalParentId!} 
                    label='External Parent Id'
                />
            </Section>
        );
    }

    private handleUniversalIdChange = (val: any, propName: string) => {
        const { changeHandler } = this.props.data;
        let value = val;
        if (value && !value.startsWith(this.uidBase)) {
            value = this.uidBase + val;
        } else if (!value || value === this.uidBase) {
            value = null;
        }
        changeHandler(value, propName);
    }
};
