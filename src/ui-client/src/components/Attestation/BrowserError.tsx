/* Copyright (c) 2019, UW Medicine Research IT
 * Developed by Nic Dobbins and Cliff Spital
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';

export default class BrowserError extends React.PureComponent {
    public render() {
        const c = `attestation`

        return  (
            <div className={`${c}-browser-error`}>
                <div className={`${c}-browser-error-inner`}>
                    <div>
                        <p>
                            <span>In order to give you the best user experience and security, Leaf can only be used on modern browsers.</span>
                            <br/>
                            <span>Please use the latest version of one of the browsers listed below and log in again.</span>
                        </p>
                    </div>
                    <div className={`${c}-browser`}>
                        <img className={`${c}-browser-chrome`} src={process.env.PUBLIC_URL + '/images/logos/browsers/chrome.png'} />
                        <div className={`${c}-browser-version`}>72+</div>
                    </div>
                    <div className={`${c}-browser`}>
                        <img className={`${c}-browser-firefox`} src={process.env.PUBLIC_URL + '/images/logos/browsers/firefox.png'} />
                        <div className={`${c}-browser-version`}>65+</div>
                    </div>
                    <div className={`${c}-browser`}>
                        <img className={`${c}-browser-edge`} src={process.env.PUBLIC_URL + '/images/logos/browsers/edge.png'} />
                        <div className={`${c}-browser-version`}>44+</div>
                    </div>
                    <div className={`${c}-browser`}>
                        <img className={`${c}-browser-safari`} src={process.env.PUBLIC_URL + '/images/logos/browsers/safari.png'} />
                        <div className={`${c}-browser-version`}>12+</div>
                    </div>
                </div>
            </div>
        )
    }
}