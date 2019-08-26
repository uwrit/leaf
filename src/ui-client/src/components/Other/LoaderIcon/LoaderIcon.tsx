/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

// Adapted from https://codepen.io/jczimm/pen/vEBpoL
import React from 'react';
import './LoaderIcon.css';
import './LoaderIconFallback.css';

interface Props {
    size?: number;
    strokeWidth?: number;
}

const LoaderIcon = (props: Props) => {
    const height = props.size || 15;
    const width = props.size || 15;
    const strokeWidth = props.strokeWidth || 4;

    return (
        <div className="loader" style={{ height, width }}>
            <svg className="loader-svg" viewBox="25 25 50 50">
                <circle className="loader-path" cx="50" cy="50" r="20" fill="none" style={{ strokeWidth }} strokeMiterlimit="10"/>
            </svg>
        </div>
    );
};

export default LoaderIcon;