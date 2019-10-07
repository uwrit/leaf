/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { NavItem } from 'reactstrap';
import { FiUploadCloud, FiUsers } from 'react-icons/fi';
import { FaChevronDown } from 'react-icons/fa';
import { toggleImportRedcapModal } from '../../actions/dataImport';
import ImportState from '../../models/state/Import';

interface Props {
    dispatch: any;
    importOptions: ImportState;
}

export default class ImportButton extends React.PureComponent<Props> {
    private className = 'header';

    public render() {
        const c = this.className;
        const { mrn, redCap } = this.props.importOptions;

        return (
            <NavItem className={`${c}-import ${c}-item-dropdown ${c}-item-hover-dark`}>
                <div className={`${c}-import-icon-container`}>
                    <FiUploadCloud className={`${c}-options-icon ${c}-import-icon`}/>
                    <span className={`${c}-options-text`}>Import</span>
                    <FaChevronDown className={`${c}-options-chevron`}/>
                </div>
                <div className={`${c}-option-container ${c}-import-container`}>
                    <div className={`${c}-option-inner`}>


                        {/* REDCap */}
                        {redCap.enabled && 
                        <div className={`${c}-option`} onClick={this.handleRedcapImportClick}>
                            <img alt='redcap-logo' className={`${c}-icon-redcap`} src={`${process.env.PUBLIC_URL}/images/logos/apps/redcap.png`}/>
                            <span>REDCap Project</span>
                        </div>
                        }

                        {/* MRNs */}
                        {mrn.enabled &&
                        <div className={`${c}-option`}>
                            <FiUsers className={`${c}-icon-mrn`} />
                            <span>MRNs</span>
                        </div>
                        }

                    </div>
                </div>
            </NavItem>
        );
    }

    private handleRedcapImportClick = () => {
        const { dispatch } = this.props;
        dispatch(toggleImportRedcapModal());
    }
}
