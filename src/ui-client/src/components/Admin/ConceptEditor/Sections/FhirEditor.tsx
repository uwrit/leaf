/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Section } from '../../Section/Section';
import { TextArea } from '../../Section/TextArea';
import { SectionProps } from '../Props';

interface Props {
    data: SectionProps;
}

export class FhirEditor extends React.PureComponent<Props> {

    public render() {
        const { data } = this.props;
        const { adminConcept } = data;
        return (
            <Section header='FHIR'>
                <TextArea 
                    changeHandler={this.handleFhirUpdate} propName={'fhirResourceShapeId'} value={adminConcept!.fhirResourceShapeId}
                    label='FHIR Resource'
                />
                <TextArea 
                    changeHandler={this.handleFhirUpdate} propName={'fhirSearchParameters'} value={adminConcept!.fhirSearchParameters} 
                    label='Numeric Field or expression' subLabel='Used if filtered by a number'
                />
            </Section>
        );
    }

    private handleFhirUpdate = (val: any, propName: string) => {
        const { changeHandler } = this.props.data;
        changeHandler(val, propName);
    }
};
