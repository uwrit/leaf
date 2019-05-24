/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { FiBarChart2 } from 'react-icons/fi';
import { Bar, BarChart, LabelList, ResponsiveContainer, XAxis } from 'recharts';
import { Concept, PatientCountPerYear, PatientCountPerYearGrouped, DisplayablePatientCountPerYear } from '../../../models/concept/Concept';
import { formatLargeNumber, formatSmallNumber } from '../../../utils/formatNumber';
import PopupBox from '../../Other/PopupBox/PopupBox';
import TextareaAutosize from 'react-textarea-autosize';
import './LearnMoreButton.css';

interface Props {
    concept: Concept;
}

interface State {
    DOMRect?: DOMRect;
    showInfoBox: boolean;
}

/*
const testYears: PatientCountPerYear[] = [
    { patientCount: 341 },
    { year: 1994, patientCount: 622 },
    { year: 1995, patientCount: 231 },
    { year: 1996, patientCount: 522 },
    { year: 1997, patientCount: 324 },
    { year: 1998, patientCount: 787 },
    { year: 1999, patientCount: 231 },
    { year: 2000, patientCount: 622 },
    { year: 2001, patientCount: 212 },
    { year: 2002, patientCount: 123 },
    { year: 2003, patientCount: 772 },
    { year: 2004, patientCount: 341 },
    { year: 2005, patientCount: 232 },
    { year: 2006, patientCount: 231 },
    { year: 2007, patientCount: 152 },
    { year: 2008, patientCount: 123 },
    { year: 2009, patientCount: 789 },
    { year: 2010, patientCount: 342 },
    { year: 2011, patientCount: 123 },
    { year: 2012, patientCount: 231 },
    { year: 2013, patientCount: 235 },
    { year: 2014, patientCount: 908 },
    { year: 2015, patientCount: 458 },
    { year: 2016, patientCount: 632 },
    { year: 2017, patientCount: 341 },
    { year: 2018, patientCount: 342 },
    { year: 2019, patientCount: 214 },
    { year: 2020, patientCount: 528 }
];
*/

export default class LearnMoreButton extends React.PureComponent<Props,State> {
    private className = 'concept-tree-learn-more';
    private startYear = 1995;
    private currYear = new Date().getFullYear();
    private height = 250;
    private margin = {top: 20, right: 20, left: 20, bottom: 20};
    private minWidth = 300;
    private maxWidth = 1000;
    constructor(props: Props) {
        super(props);
        this.state = {
            showInfoBox: false
        }
    }

    public render(): any {
        const { concept } = this.props;
        const c = this.className;
        const countsByYear = concept.uiDisplayPatientCountByYear;
        const calcWidth = countsByYear ? (countsByYear.length * 40) : this.minWidth;
        const formatterThreshold = 10000;
        const data = countsByYear
            ? this.groupYears(countsByYear)
                .map((p: DisplayablePatientCountPerYear) => ({ ...p, label: p.patientCount >= formatterThreshold 
                    ? formatLargeNumber(p.patientCount)
                    : formatSmallNumber(p.patientCount)
                }))
            : countsByYear;
        const width = calcWidth < this.minWidth 
            ? this.minWidth : calcWidth > this.maxWidth 
            ? this.maxWidth : calcWidth;

        return (
            <span className={`${c}-button`} onClick={this.handleClick}>
                <FiBarChart2 />
                <div>
                    Learn More

                    {/* Popup Box */}
                    {this.state.showInfoBox &&
                    <PopupBox 
                        parentDomRect={this.state.DOMRect!} 
                        toggle={this.handleInfoBoxClickedOutside}>
                        <div className={`${c}`} style={{ width }}>
                            <div className={`${c}-title`}>
                                <p>{concept.uiDisplayName}</p>
                                <p className={`${c}-universalid`}>
                                    {concept.universalId
                                        ? <span className={`${c}-universalid-value`}>{concept.universalId}</span> 
                                        : <span className={`${c}-universalid-none`}>local concept only</span> 
                                    }
                                </p>
                            </div>
                            <div className={`${c}-separator`} />

                            {/* Counts by Year chart */}
                            {countsByYear &&
                            <ResponsiveContainer height={this.height}>
                            <BarChart 
                                data={data} 
                                barCategoryGap={1} 
                                className={`${c}-chart`}
                                margin={this.margin}>
                                <XAxis 
                                    dataKey="year" 
                                    interval={0} 
                                    axisLine={false} 
                                    tickLine={false} 
                                    label={{ value: 'Unique patients by Year', position: 'bottom', className:`${c}-axis-label` }}/>
                                <Bar 
                                    barSize={35}
                                    dataKey="patientCount" 
                                    fill={'rgb(255, 132, 8)'} 
                                    isAnimationActive={true}>
                                    <LabelList 
                                        dataKey="label" 
                                        position="top"/>
                                </Bar>
                            </BarChart>
                            </ResponsiveContainer>}

                            {countsByYear && <div className={`${c}-separator-long`} />}

                            {/* Tooltip / Info */}
                            {concept.uiDisplayTooltip &&
                            <div className={`${c}-info`}>
                                <TextareaAutosize
                                    readOnly={true}
                                    spellCheck={false}
                                    value={concept.uiDisplayTooltip}>
                                </TextareaAutosize>
                            </div>
                            }
                            {!concept.uiDisplayTooltip &&
                            <p className={`${c}-noinfo`}>
                                No information provided for this concept
                            </p>
                            }

                        </div>    
                    </PopupBox>
                    }
                </div>
            </span>
        )       
    }

    private handleClick = (e: any) => { 
        if (e.target.className === e.currentTarget.className || !this.state.showInfoBox) {
            const domRect: DOMRect = e.target.getBoundingClientRect();
            this.setState({ showInfoBox: !this.state.showInfoBox, DOMRect: domRect });
        }
    }

    private handleInfoBoxClickedOutside = () => {
        this.setState({ showInfoBox: !this.state.showInfoBox });
    }

    private groupYears = (ungrouped: PatientCountPerYear[]): PatientCountPerYearGrouped[] => {
        const output: PatientCountPerYearGrouped[] = [];
        const nullYear: PatientCountPerYearGrouped = { year: '?', patientCount: 0 };
        const startYear: PatientCountPerYearGrouped = { year: `<${this.startYear}`, patientCount: 0 };
        const greaterThanCurrentYear: PatientCountPerYearGrouped = { year: `>${this.currYear}`, patientCount: 0 };

        for (const bar of ungrouped) {
            if (!bar.year)                      { nullYear.patientCount += bar.patientCount; }
            else if (bar.year < this.startYear) { startYear.patientCount += bar.patientCount; }
            else if (bar.year > this.currYear)  { greaterThanCurrentYear.patientCount += bar.patientCount; }
            else                                { output.push({ year: `${bar.year}`, patientCount: bar.patientCount }); }
        }

        if (startYear.patientCount)              { output.splice(0, 0, startYear); }
        if (nullYear.patientCount)               { output.splice(0, 0, nullYear); }
        if (greaterThanCurrentYear.patientCount) { output.push(greaterThanCurrentYear); }
        return output;
    }
}
