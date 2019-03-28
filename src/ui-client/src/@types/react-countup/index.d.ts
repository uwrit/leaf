/* Copyright (c) 2019, UW Medicine Research IT
 * Developed by Nic Dobbins and Cliff Spital
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

declare module "react-countup" {

    import React from 'react';

    export interface CountUpProps  {
        className?: string;
        start: number;
        end: number;
        duration: number;
        decimals: number;
        formattingFn?: (value: number) => string;
    }

    export default class CountUp extends React.Component<CountUpProps> { }
}