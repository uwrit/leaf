/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import * as React from 'react';
import { formatSmallNumber } from '../../utils/formatNumber';

interface Props {
    exportLimit: number;
    isIdentified: boolean;
    totalCohortPatients: number;
    totalDatapoints: number;
    totalPatients: number;
}

export function RowCount(props: Props) {
    const { totalPatients, totalDatapoints, isIdentified, exportLimit, totalCohortPatients } = props;
    const c = 'patientlist';

    return (
        <div className={`${c}-rowcount-container`}>
            <span>Displaying </span>
            <span className={`${c}-rowcount`}>{formatSmallNumber(totalPatients)} 
                {!isIdentified &&
                <span> de-identified</span>}
                <span> patients</span>
            </span> 
            <span> with </span>
            <span className={`${c}-rowcount`}>{formatSmallNumber(totalPatients + totalDatapoints)} rows</span>
            <span> of data</span>
            {totalPatients < totalCohortPatients && 
            <div className={`${c}-info`}>
                <div className={`${c}-info-inner`}>Why can't I see data for all {formatSmallNumber(totalCohortPatients)} patients?
                    <div className={`${c}-info-detail`}>
                        <span>Your administrator has limited viewing and exporting to </span>
                        <span className={`${c}-info-emphasis`}>{formatSmallNumber(exportLimit)} patients at a time</span> 
                        <span>, which is less than the total number in your cohort.</span>
                    </div>
                </div>
            </div>
            }
            {!isIdentified &&
            <div className={`${c}-info`}>
                <div className={`${c}-info-inner`}>What is de-identification?
                    <div className={`${c}-info-detail`}>
                        <p>
                            Because you've logged in <span className={`${c}-info-emphasis`}>de-identified mode</span>, Leaf has date-shifted and removed identifiers for all data shown below.
                            This means that all dates have been randomly shifted a certain amount of time, and identifiers such as MRNs and names have been removed.
                        </p>
                        <p>
                            Note: While the amount of time shifted is different between patients, the 
                            <span className={`${c}-info-emphasis`}> date-shift value for a given patient is consistent</span>
                            , so the relative age at an event is preserved.
                        </p>
                    </div>
                </div>
            </div>
            }
        </div>
    );
}
