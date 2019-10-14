/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import ImportState from '../../../../models/state/Import';
import REDCapImportSection from './REDCapImportSection';

interface Props {
    data: ImportState;
}

export default class ImportComplete extends React.PureComponent<Props> {
    private className = 'import-redcap';

    public render() {
        const c = this.className;
        const { data } = this.props;
        const { redCap } = data;

        return (
            <REDCapImportSection>
                <div>Total Rows: {redCap.rows}</div>
                <div>Total Patients: {redCap.patients}</div>
                <div>Imported Rows: {redCap.summary.importedRows}</div>
                <div>Imported Patients: {redCap.summary.importedPatients}</div>
                <div>No MRN: {redCap.rows - redCap.summary.importedRows}</div>
                <div>MRN exists but not found: {redCap.summary.unmappedPatients.length}</div>
                <div>Users: {redCap.summary.users.join(',')}</div>
            </REDCapImportSection>
        );
    }
};