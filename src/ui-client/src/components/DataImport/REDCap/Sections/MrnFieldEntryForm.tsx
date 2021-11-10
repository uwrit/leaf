/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import REDCapImportSection from './REDCapImportSection';
import { REDCapImportState } from '../../../../models/state/Import';
import MetadataSummary from './MetadataSummary';
import MrnFieldSearchBox from './MrnFieldSearchBox';

interface Props {
    dispatch: any;
    mrnFieldInputChangeHandler: (token: string) => void;
    redCap: REDCapImportState;
    setMrnFieldValid: (valid: boolean) => void;
    valid: boolean;
}

export default class MrnFieldEntryForm extends React.PureComponent<Props> {
    public render() {
        const { dispatch, redCap, setMrnFieldValid, valid } = this.props;

        return (
            <REDCapImportSection>
                <MetadataSummary redCap={redCap} />
                <p>
                    Great! Leaf successfully found your REDCap project.
                </p>
                <p>
                    <strong>Next, select the REDCap field which represents patient identifiers (e.g., an MRN). </strong>
                    <strong>Leaf will use these values to link patients in the clinical database to your REDCap patients.</strong>
                </p>
                <MrnFieldSearchBox 
                    redCap={redCap} 
                    dispatch={dispatch} 
                    mrnFieldChangeHandler={this.handleMrnFieldInputChange} 
                    setMrnFieldValid={setMrnFieldValid} 
                    valid={valid}
                />
            </REDCapImportSection>
        );
    }

    /* 
     * Handle changes to the MRN field input box.
     */
    private handleMrnFieldInputChange = (field: string) => {
        const { mrnFieldInputChangeHandler } = this.props;
        mrnFieldInputChangeHandler(field);
    }
};