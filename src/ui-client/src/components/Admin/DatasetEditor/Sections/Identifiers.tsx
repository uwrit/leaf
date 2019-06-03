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
    constructor(props: Props) {
        super(props);
    }

    public render() {
        const { dataset, handleInputChange, locked } = this.props;
        return (
            <Section header='Identifiers'>
                <TextArea 
                    changeHandler={handleInputChange} propName={'universalId'} value={dataset ? dataset.universalId : ''}
                    label='Universal Id' subLabel='Used if Leaf is querying multiple instances. This Id must match at all institutions in order for queries to be mapped correctly.' locked={locked}
                />
                <Tagger
                    changeHandler={handleInputChange} propName={'tags'} tags={dataset ? dataset.tags : []} locked={locked}
                />
            </Section>
        );
    }
};
