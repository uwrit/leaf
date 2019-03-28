/* Copyright (c) 2019, UW Medicine Research IT
 * Developed by Nic Dobbins and Cliff Spital
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

interface AntPathOption {
    color: string;
    dashArray: number[];
    delay: number;
    opacity: number;
    pulseColor: string;
    reverse?: boolean;
    smoothFactor: number;
    weight: number;
}

const def: AntPathOption = {
    color: 'white',
    dashArray: [800,30],
    delay: 20,
    opacity: 0.5,
    pulseColor: 'blue',
    smoothFactor: 1,
    weight: 1.5
}

const resultReceived: AntPathOption = {
    ...def,
    color: 'white',
    opacity: 0.8,
    pulseColor: '#1ca8dd',
    reverse: true
};

const sendingQuery: AntPathOption = {
    ...def,
    color: 'white',
    pulseColor: 'green',
};

export const antPathOptionTypes = {
    RESULT_RECEIVED: resultReceived,
    SENDING_QUERY: sendingQuery
}

