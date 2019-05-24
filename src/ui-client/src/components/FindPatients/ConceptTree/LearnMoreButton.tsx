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
import CheckboxSlider from '../../Other/CheckboxSlider/CheckboxSlider';

interface Props {
    concept: Concept;
}

interface State {
    DOMRect?: DOMRect;
    showInfoBox: boolean;
    ShowAllYears: boolean;
}

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
            showInfoBox: false,
            ShowAllYears: false
        }
    }

    public getYearData = () => {
        const { concept } = this.props;
        const formatterThreshold = 10000;

        if (concept.uiDisplayPatientCountByYear) {
            let data: DisplayablePatientCountPerYear[] = [];
            if (!this.state.ShowAllYears) {
                data = this.groupYears(concept.uiDisplayPatientCountByYear);
            } else {
                data = concept.uiDisplayPatientCountByYear;
            }
            return data.map((p: DisplayablePatientCountPerYear) => ({ 
                ...p, 
                label: !p.year ? '?' :
                    p.patientCount >= formatterThreshold 
                        ? formatLargeNumber(p.patientCount)
                        : formatSmallNumber(p.patientCount)
            }))
        }
        return [];
    }

    public render(): any {
        const { concept } = this.props;
        const { showInfoBox, ShowAllYears, DOMRect } = this.state;
        const c = this.className;
        const countsByYear = concept.uiDisplayPatientCountByYear;
        const calcWidth = countsByYear ? (countsByYear.length * 40) : this.minWidth;
        const data = this.getYearData();
        const width = calcWidth < this.minWidth 
            ? this.minWidth : calcWidth > this.maxWidth 
            ? this.maxWidth : calcWidth;

        return (
            <span className={`${c}-button`} onClick={this.handleClick}>
                <FiBarChart2 />
                <div>
                    Learn More

                    {/* Popup Box */}
                    {showInfoBox &&
                    <PopupBox 
                        parentDomRect={DOMRect!} 
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

                            {countsByYear && 
                                <div className={`${c}-show-all-years`}>
                                    <div className={`${c}-show-all-years-text`}>
                                        Show all years
                                    </div>
                                    <CheckboxSlider checked={ShowAllYears} onClick={this.handleShowAllYearsClick} />
                                </div>
                            }

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

    private handleShowAllYearsClick = () => {
        this.setState({ ShowAllYears: !this.state.ShowAllYears });
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
