/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import ImportState from '../../../../models/state/Import';
import REDCapImportSection from './REDCapImportSection';
import { Row, Col } from 'reactstrap';

interface Props {
    data: ImportState;
}

export default class ImportComplete extends React.PureComponent<Props> {
    private className = 'import-redcap-summary';

    public render() {
        const c = this.className;
        const { data } = this.props;
        const { redCap } = data;
        const users = redCap.config!.users.map(u => u.username)

        return (
            <REDCapImportSection>
                <div className={c}>
                    <p>
                        Your REDCap project was successfully imported!
                    </p>
                    <p>
                        <span className={`${c}-emphasis`}>Your imported data can be queried in the Concept Tree under <strong>REDCap Imports -> {`${redCap.config!.projectInfo.project_title}`}</strong>. </span>
                        <span>Your project data will only be visible to any user able to access your existing REDCap project.</span>
                    </p>

                    <Row>
                        <Col md={4}>
                            <div className={`${c}-value`}>{redCap.patients.toLocaleString()}</div>
                            <div className={`${c}-text`}>Patients Added</div>
                        </Col>
                        <Col md={4}>
                            <div className={`${c}-value`}>{redCap.rows.toLocaleString()}</div>
                            <div className={`${c}-text`}>Data Rows Added</div>
                        </Col>
                        <Col md={4}>
                            <div className={`${c}-value`}>{redCap.summary.unmappedPatients.length.toLocaleString()}</div>
                            <div className={`${c}-text`}>Patient Not Imported</div>
                        </Col>
                    </Row>

                    <div className={`${c}-users`}>
                        <div className={`${c}-value`}>{users.join(', ')}</div>
                        <div className={`${c}-text`}>Permitted Users</div>
                    </div>
                </div>
            </REDCapImportSection>
        );
    }
};