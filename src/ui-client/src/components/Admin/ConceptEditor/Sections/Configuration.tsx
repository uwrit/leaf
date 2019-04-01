/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Section } from './Section';
import { Checkbox } from './Checkbox';
import { SectionProps } from '../Props';
import { Container } from 'reactstrap';

interface Props {
    data: SectionProps;
}

export class Configuration extends React.PureComponent<Props> {
    constructor(props: Props) {
        super(props);
    }

    public render() {
        const { changeHandler, adminConcept, togglePanelPreview } = this.props.data;
        return (
            <Section header='Configuration'>
                <Container fluid={true}>
                    <Checkbox 
                        changeHandler={changeHandler} propName={'isParent'} value={adminConcept!.isParent} 
                        label='Has Child Concepts'
                    />
                    <Checkbox 
                        changeHandler={changeHandler} propName={'isNumeric'} value={adminConcept!.isNumeric}
                        focusToggle={togglePanelPreview}
                        label='Is Numeric'
                    />
                    <Checkbox
                        changeHandler={changeHandler} propName={'isPatientCountAutoCalculated'} value={adminConcept!.isPatientCountAutoCalculated} 
                        label='Auto-Calculate Patient Count'
                    />
                    <Checkbox 
                        changeHandler={changeHandler} propName={'isSpecializable'} value={adminConcept!.isSpecializable} 
                        label='Allow Dropdowns'
                    />
                </Container>
            </Section>
        );
    }
};
