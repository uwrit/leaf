/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
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
        },
        languageByHeritage: {
            barSize: 36,
            colors: ["#9467bd", "#4DD0E1", "#FFA726", "#FFD600", "#9575CD", "#EF5350", "#7f7f7f", "#4285F5", "#2ca02c", "#1f77b4"],
            xAxisStroke: 'rgb(33,37,41)'
        },
        religion: {
            barSize: 36,
            colors: [ "rgb(31, 119, 180)", "rgb(174, 199, 232)", "rgb(255, 127, 14)", "rgb(255, 187, 120)", "rgb(44, 160, 44)", "rgb(152, 223, 138)", "rgb(214, 39, 40)", "rgb(255, 152, 150)", 
                      "rgb(148, 103, 189)", "rgb(197, 176, 213)", "rgb(140, 86, 75)", "rgb(196, 156, 148)", "rgb(227, 119, 194)", "rgb(247, 182, 210)", "rgb(127, 127, 127)", "rgb(199, 199, 199)", 
                      "rgb(188, 189, 34)", "rgb(219, 219, 141)", "rgb(23, 190, 207)", "rgb(158, 218, 229)"]
        }
    }
}