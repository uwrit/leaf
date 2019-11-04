/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { NavItem } from 'reactstrap';
import { FaDatabase, FaChevronDown } from 'react-icons/fa';
import { NetworkResponderMap } from '../../models/NetworkResponder';
import NetworkHealthResponder from './NetworkHealthResponder/NetworkHealthResponder';
import { CohortStateType } from '../../models/state/CohortState';

interface Props {
    dispatch: any;
    responders: NetworkResponderMap;
    queryState: CohortStateType;
}

export default class DatabasesButton extends React.PureComponent<Props> {
    private className = 'header';

    public render() {
        const c = this.className;
        const { responders } = this.props;
        const resps: number[] = []; 
        const allowDisable = this.props.responders.size > 1;
        let totalActiveResponders = 0;
        responders.forEach(ni => { 
            if (!ni.isGateway) {
                resps.push(ni.id);
                if (ni.enabled) { totalActiveResponders += 1; }
            }
        });

        return (
            <NavItem className={`${c}-networkhealth ${c}-item-dropdown ${c}-item-hover-dark`} >
                <div className={`${c}-networkhealth-text`}>
                    <div>
                        <FaDatabase className={`${c}-options-icon ${c}-database-icon`}/>
                    </div>
                    <div>
                        <span className={`${c}-options-text`}>Databases</span>
                        <FaChevronDown className={`${c}-options-chevron`}/>
                    </div>
                </div>
                <div className={`${c}-option-container ${c}-networkhealth-container`}>
                    <div className={`${c}-option-inner`}>
                        <div className={`${c}-networkhealth-description`}>
                            <span>Clinical databases available to query</span>
                        </div>
                        {resps.map((id: number) => (
                            <NetworkHealthResponder
                                allowDisable={allowDisable}
                                key={id} 
                                dispatch={this.props.dispatch} 
                                identity={this.props.responders.get(id)!} 
                                queryState={this.props.queryState}
                                totalActiveResponders={totalActiveResponders}/>
                        ))}
                    </div>
                </div>
            </NavItem>
        );
    }
}
