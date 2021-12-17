/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import './GlowingButton.css';

export enum GLOWING_BUTTON_STATE {
    GRAY = 0,
    GREEN = 1,
    YELLOW = 2,
    RED = 3
}

interface Props {
    className?: string;
    indicator: GLOWING_BUTTON_STATE
}

export default class GlowingButton extends React.PureComponent<Props> {
    private className = 'glowing-button';
    
    public render() {
        const c = `${this.className} ${GLOWING_BUTTON_STATE[this.props.indicator].toLowerCase()} ${this.props.className ? this.props.className : ''}`
        return (
            <div className={c} />
        );
    }
}
