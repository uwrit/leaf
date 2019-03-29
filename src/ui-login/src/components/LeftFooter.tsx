/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import './Footer.css';

interface Props {}

export default class LeftFooter extends React.PureComponent<Props> {

    public render() {
        const c = 'footer';

        return (
            <div className={c}>
                <p className={`${c}-shoutout`}>
                    <span>Developed with ❤️ in Seattle by </span> 
                    <a href="https://github.com/ndobb" target="_">Nic Dobbins</a>
                    <span> and </span>
                    <a href="https://github.com/cspital" target="_">Cliff Spital</a>
                    <span> of </span>
                    <a href="https://github.com/UW-Medicine-Research-IT" target="_">UW Medicine Research IT</a>
                </p>
            </div>
        );
    }
}