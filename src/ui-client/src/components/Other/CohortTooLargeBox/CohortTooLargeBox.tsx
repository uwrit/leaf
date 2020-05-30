/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { formatSmallNumber } from '../../../utils/formatNumber';
import './CohortTooLargeBox.css';

interface Props {
    cacheLimit: number
}

const className = 'cohort-too-large';

export default class CohortTooLargeBox extends React.PureComponent<Props> {
    public render() {
        const { cacheLimit } = this.props;
        return (
            <div className={className}>
                <p>
                    Whoops! Leaf can't show visualizations or patient lists for a cohort this large.
                    Your Leaf administrator has only configured Leaf to display up to <span>{formatSmallNumber(cacheLimit)}</span> patients.
                </p>
            </div>
        );
    }
}