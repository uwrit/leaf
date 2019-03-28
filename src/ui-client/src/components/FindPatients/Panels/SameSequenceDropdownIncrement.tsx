/* Copyright (c) 2019, UW Medicine Research IT
 * Developed by Nic Dobbins and Cliff Spital
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';

interface Props {
    currentIncrement: string;
    onClickFunc: (dateTypeString: string) => any;
}

const SameSequenceDropdownIncrement = (props: Props) => {
    const className = 'same-sequence-dropdown-increment';
    const dateStrings = [ 'MINUTE', 'HOUR', 'DAY', 'WEEK', 'MONTH', 'YEAR' ];
    const incrementTypes = dateStrings.map((key: string, i) => {

        const onClick = () => { props.onClickFunc(key)};
        const classes = [ `${className}-item leaf-dropdown-item`, (key === props.currentIncrement ? 'selected' : '') ];

        return (
            <div 
                className={classes.join(' ')} 
                key={key} 
                onClick={onClick}>
                {`${key[0]}${key.substring(1).toLowerCase()}(s)`}
            </div>
        );
    })

    return (
        <div className={className}>
            {incrementTypes}
        </div>
    )
}

export default SameSequenceDropdownIncrement;