/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { AuthorizationState } from '../../models/state/AppState';
import { MdTagFaces } from 'react-icons/md';
import './HelpButton.css';

interface Props {
    auth?: AuthorizationState;
}

export default class HelpButton extends React.PureComponent<Props> {
    private className = 'help';

    constructor(props: Props) {
        super(props);
    }

    public render() {
        const { auth } = this.props;
        const c = this.className;
        if (!auth || !auth.config || !auth.config.clientOptions.help.enabled) { return null; }
        const { email } = auth.config.clientOptions.help;

        return (
            <div className={`${c}-container`}>
                <div className={`${c}-icon-container`}>
                    <MdTagFaces />
                </div>
                <div className={`${c}-inner`}>
                    <span>Need Help? <a href={`mailto:${email}`}>Contact a Leaf administrator</a></span>
                </div>
            </div>
        )
    }
}