/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { NavItem } from 'reactstrap';
import { FaPlus } from 'react-icons/fa';

interface Props {
    startNewQueryClickHandler: () => any;
}

export default class NewQueryButton extends React.PureComponent<Props> {
    private className = 'header';

    public render() {
        const c = this.className;
        const { startNewQueryClickHandler } = this.props;

        return (
            <NavItem className={`${c}-new-query`} onClick={startNewQueryClickHandler}>
                <div className={`${c}-option-container`}>
                    <FaPlus className={`${c}-options-icon ${c}-new-query-icon`}/>
                    <div className={`${c}-options-text ${c}-new-query`}>
                        <span>New Query</span>
                    </div>
                </div>
            </NavItem>
        );
    }
}
