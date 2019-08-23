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

    public render() {
        const { auth } = this.props;
        const c = this.className;
        if (!auth || !auth.config || !auth.config.client.help.enabled) { return null; }
        const { help } = auth.config.client;

        return (
            <div className={`${c}-container`}>
                <div className={`${c}-icon-container`}>
                    <MdTagFaces />
                </div>
                <div className={`${c}-needhelp`}>Need Help?</div>
                <div className={`${c}-outer`}>
                    <div className={`${c}-inner`}>
                        {!!help.email &&
                            <div className={`${c}-contact`}>
                                <a href={`mailto:${help.email}`}>Contact a Leaf administrator</a>
                                {!!help.uri && 
                                [
                                    <span key={1}> or </span>,
                                    <a href={help.uri} target="_" key={2}>Learn more here</a>
                                ]
                                }
                            </div>
                        }
                        {!help.email && !!help.uri &&
                            <a href={help.uri} target="_">Learn more here</a>
                        }
                    </div>
                </div>
            </div>
        )
    }
}