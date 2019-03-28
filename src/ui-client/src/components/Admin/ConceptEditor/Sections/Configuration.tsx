/* Copyright (c) 2019, UW Medicine Research IT
 * Developed by Nic Dobbins and Cliff Spital
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Section } from './Section';
import { Concept } from '../../../../models/admin/Concept';
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
        const { changeHandler, concept, togglePanelPreview } = this.props.data;
        return (
            <Section header='Configuration'>
                <Container fluid={true}>
                    <Checkbox 
                        changeHandler={changeHandler} propName={'isParent'} value={concept!.isParent} 
                        label='Has Child Concepts'
                    />
                    <Checkbox 
                        changeHandler={changeHandler} propName={'isRoot'} value={concept!.isRoot} 
                        label='Is Root Concept'
                    />
                    <Checkbox 
                        changeHandler={changeHandler} propName={'isNumeric'} value={concept!.isNumeric}
                        focusToggle={togglePanelPreview}
                        label='Is Numeric'
                    />
                    <Checkbox
                        changeHandler={changeHandler} propName={'isPatientCountAutoCalculated'} value={concept!.isPatientCountAutoCalculated} 
                        label='Auto-Calculate Patient Count'
                    />
                    <Checkbox 
                        changeHandler={changeHandler} propName={'isSpecializable'} value={concept!.isSpecializable} 
                        label='Allow Dropdowns'
                    />
                </Container>
            </Section>
        );
    }
};
