/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

export const visualizationConfig = {
    demographics: {
        ageByGender: {
            barCategoryGap: 2,
            barSize: 36,
            colorFemale: 'rgb(255,132,8)', // Orange
            colorMale: 'rgb(0,148,204)',   // Blue
            colorOther: 'rgb(200,200,200)',
            xAxisStroke: 'rgb(33,37,41)',
        },
        binary: {
            barSize: 36,
            colors: {
                AARP:        { left: '#00BCD4', right: '#4DD0E1'},
                Gender:      { left: '#f44336', right: '#e57373'},
                Hispanic:    { left: '#8bc34a', right: '#AED581'},
                Married:     { left: '#FFC107', right: '#FFD54F'},
                VitalStatus: { left: '#9C27B0', right: '#B868C8'}
            },
            xAxisStroke: 'rgb(33,37,41)'
        }
    }
}