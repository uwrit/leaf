/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import REDCapImportSection from './REDCapImportSection';
import { FormGroup, Label, Input } from 'reactstrap';
import { REDCapImportState } from '../../../../models/state/Import';

interface Props {
    tokenInputChangeHandler: (token: string) => void;
    redCap: REDCapImportState;
}

export default class ApiTokenEntryForm extends React.PureComponent<Props> {
    private className = 'import-redcap';

    public render() {
        const c = this.className;
        const { redCap } = this.props;

        return (
            <REDCapImportSection>
                <p>
                    The Leaf REDCap Project Import tool allows you to copy project data directly from REDCap into Leaf, linking patients in REDCap 
                    to the same patients available in Leaf. Start by entering your REDCap Project API Token.
                </p>
                <p>
                    <strong>Your REDCap data will only be visible to you and other users already able to access the Project.</strong>
                </p>
                <div className={`${c}-input ${c}-api-token-container`}>
                    <FormGroup>
                        <Label>REDCap API Token</Label>
                        <Input
                            className='leaf-input'
                            type="text" 
                            onChange={this.handleTokenInputChange} 
                            placeholder={'Enter token...'}
                            spellCheck={false}
                            value={redCap.apiToken} />
                    </FormGroup>
                </div>
            </REDCapImportSection>
        );
    }

    /* 
     * Handle changes to the token input box.
     */
    private handleTokenInputChange = (e: React.FormEvent<HTMLInputElement>) => {
        const { tokenInputChangeHandler } = this.props;
        tokenInputChangeHandler(e.currentTarget.value);
    }
};