/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import './InfoBox.css';

interface Props {}

export default class InfoBox extends React.PureComponent<Props> {

    public render() {
        const c = 'infobox';

        return (
            <div className={c}>
                <div className={`${c}-header`}>Welcome to Leaf!</div>
                <p className={`${c}-desc`}>Leaf is a fast, secure web app for querying clinical data.</p>
                <p><a href="https://www.iths.org/investigators/services/bmi/leaf/" target="_">Learn more about Leaf</a></p>
                <p><a href="https://one.uwmedicine.org/sites/its/analytics" target="_">Request Access</a></p>
            </div>
        );
    }
}