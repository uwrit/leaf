/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import * as React from 'react';
import { formatSmallNumber } from '../../../utils/formatNumber';

interface Props {
    exportLimit: number;
    isIdentified: boolean;
    isFederated: boolean;
    totalCohortPatients: number;
    totalDatapoints: number;
    totalPatients: number;
}

export const RowCount = (props: Props) => {
    const { totalPatients, totalDatapoints, isIdentified, isFederated, exportLimit, totalCohortPatients } = props;
    const c = 'patientlist';

    return (
        <div className={`${c}-rowcount-container`}>

            {/* Total Patient and Row counts */}
            <span>Displaying </span>
            <span className={`${c}-rowcount`}>{formatSmallNumber(totalPatients)} 
                {!isIdentified &&
                <span> de-identified</span>}
                <span> patients</span>
            </span> 
            <span> with </span>
            <span className={`${c}-rowcount`}>{formatSmallNumber(totalPatients + totalDatapoints)} rows</span>
            <span> of data</span>

            {/* Total Displayed Patients less than Total in Cohort */}
            {totalPatients !== totalCohortPatients &&
            <div className={`${c}-info`}>
                <div className={`${c}-info-inner`}>Why can't I see data for all {formatSmallNumber(totalCohortPatients)} patients?

                    {/* Single Node - export limit */}
                    {!isFederated && totalCohortPatients > exportLimit &&
                    <div className={`${c}-info-detail`}>
                        <span>Your administrator has limited viewing and exporting to </span>
                        <span className={`${c}-info-emphasis`}>{formatSmallNumber(exportLimit)} patients at a time</span> 
                        <span>, which is less than the total number in your cohort.</span>
                    </div>
                    }

                    {/* Single Node - missing patients */}
                    {!isFederated && totalPatients < totalCohortPatients && totalCohortPatients < exportLimit &&
                    <div className={`${c}-info-detail`}>
                        <span>The Leaf server returned demographic data for less patients than were included in the original cohort. </span>
                        <span>This usually indicates that demographic data are missing for these patients.</span>
                    </div>
                    }

                    {/* Federated */}
                    {isFederated &&
                    <div className={`${c}-info-detail`}>
                        <span>One or more of the Leaf servers you are querying may be limiting the total amount of patients you are able to view.</span>
                    </div>
                    }
                </div>
            </div>
            }

            {/* De-identification info */}
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
