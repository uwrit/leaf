/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';

interface Props {
    increment: number | null;
    dateType: string;
    onClick: (dateTypeString: string) => any;
}

const SameSequenceDropdownIncrement = (props: Props) => {
    const className = 'same-sequence-dropdown-increment';
    const dateStrings = [ 'MINUTE', 'HOUR', 'DAY', 'WEEK', 'MONTH', 'YEAR' ];
    const postfix = props.increment === 1 ? '' : 's';
    const incrementTypes = dateStrings.map((key: string, i) => {

        const onClick = (e: any) => { e.stopPropagation(); props.onClick(key)};
        const classes = [ `${className}-item leaf-dropdown-item`, (key === props.dateType ? 'selected' : '') ];

        return (
            <div 
                className={classes.join(' ')} 
                key={key} 
                onClick={onClick}>
                {`${key[0]}${key.substring(1).toLowerCase()}${postfix}`}
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