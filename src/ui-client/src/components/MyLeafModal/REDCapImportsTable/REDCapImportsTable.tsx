/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import './REDCapImportsTable.css';
import { ImportMetadata, REDCapImportStructure } from '../../../models/dataImport/ImportMetadata';
import { ConfirmationModalState } from '../../../models/state/GeneralUiState';
import { showConfirmationModal } from '../../../actions/generalUi';

interface Props {
    dispatch: any;
    imports: ImportMetadata[];
}

export default class REDCapImportsTable extends React.PureComponent<Props> {
    private className = 'myleaf-table';

    public render() {
        const { imports } = this.props;

        if (!imports.length) { return <div>No imported REDCap projects to display</div>; }

        const c = this.className;
        const classes = [ `${c}-container` ];
        const headerClass = `${c}-header`;
        const rowClass = `${c}-row`;
        const delButtonClass = `${c}-delete`;

        return  (
            <div className={classes.join(' ')}>

                {/* Table */}
                <table className={c}>

                    {/* Header */}
                    <thead className={`${c}-header`}>
                        <tr>

                            {/* Columns */}
                            <th className={headerClass}>Project Title</th>
                            <th className={headerClass}>Total Patients</th>
                            <th className={headerClass}>Total Concepts</th>
                            <th className={headerClass}>Imported</th>

                            {/* '✖' button column */}
                            <th />

                        </tr>
                    </thead>

                    {/* Body */}
                    <tbody className={`${c}-body`}>

                        {/* Rows */}
                        {imports.map((im) => {
                            const struct = im.structure as REDCapImportStructure;
                            return (
                                <tr key={im.id} className={rowClass}>
                                    <td>{struct.configuration.projectInfo.project_title}</td>
                                    <td>{struct.patients.toLocaleString()}</td>
                                    <td>{struct.concepts.length.toLocaleString()}</td>
                                    <td>{im.created.toLocaleString()}</td>
                                    <td className={delButtonClass} onClick={this.handleDeleteClick.bind(null, im)}>✖</td>
                                </tr>
                            );
                        })}
                        
                    </tbody>
                </table>
            </div>
        );
    }

    private handleDeleteClick = (im: ImportMetadata) => {
        const { dispatch } = this.props;
        const struct = im.structure as REDCapImportStructure;
        const confirm: ConfirmationModalState = {
            body: `Are you sure you want to delete the REDCap imported project "${struct.configuration.projectInfo.project_title}"? This will not affect your real data in REDCap`,
            header: 'Delete REDCap Import',
            onClickNo: () => null,
            onClickYes: async () => {
                
            },
            show: true,
            noButtonText: 'No',
            yesButtonText: `Yes, delete this project`
        };
        dispatch(showConfirmationModal(confirm));
    }
};