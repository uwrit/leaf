/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import './CheckboxSlider.css';

interface Props {
    checked: boolean;
    onClick: () => any;
}

const className = 'checkbox-slider';

export default class CheckboxSlider extends React.PureComponent<Props> {
    public render() {
        return (
            <div className={`${className}-container`} onClick={this.props.onClick}>
                <input checked={this.props.checked} readOnly={true} type="checkbox" className={`${className}-toggle ${className}-toggle-round`} />
                <label />
            </div>
        );
    }
}