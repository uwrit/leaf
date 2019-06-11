/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Section } from '../../Section/Section';
import { TextArea } from '../../Section/TextArea';
import { AdminDatasetQuery } from '../../../../models/admin/Dataset';
import { Tagger } from '../Tagger/Tagger';

interface Props {
    dataset?: AdminDatasetQuery;
    handleInputChange: (val: any, propName: string) => any;
    locked?: boolean;
}

export class Identifiers extends React.PureComponent<Props> {
    private uidBase = 'urn:leaf:dataset:';
    constructor(props: Props) {
        super(props);
    }

    public render() {
        const { dataset, handleInputChange, locked } = this.props;
        const uid = dataset && dataset.universalId
        ? dataset.universalId.replace(this.uidBase,'')
        : '';
        return (
            <Section header='Identifiers'>
                <TextArea 
                    changeHandler={this.handleUniversalIdChange} propName={'universalId'} value={uid} className={"dataset-editor-dataset-universalid"}
                    label='Universal Id' subLabel='Used if Leaf is querying multiple instances. This Id must match at all institutions in order for queries to be mapped correctly.' locked={locked}
                />
                <Tagger
                    changeHandler={handleInputChange} propName={'tags'} tags={dataset ? dataset.tags : []} locked={locked}
                />
            </Section>
        );
    }

    private handleUniversalIdChange = (val: any, propName: string) => {
        const { handleInputChange } = this.props;
        let value = val;
        if (value && !value.startsWith(this.uidBase)) {
            value = this.uidBase + val;
        } else if (!value || value === this.uidBase) {
            value = null;
        }
        handleInputChange(value, propName);
    }
};
