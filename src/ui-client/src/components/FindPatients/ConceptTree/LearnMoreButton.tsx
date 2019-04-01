/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { FiBarChart2 } from 'react-icons/fi';
import { Bar, BarChart, LabelList, ResponsiveContainer, XAxis } from 'recharts';
import { Concept, PatientCountPerYear } from '../../../models/concept/Concept';
import { formatLargeNumber, formatSmallNumber } from '../../../utils/formatNumber';
import PopupBox from '../../Other/PopupBox/PopupBox';
import './LearnMoreButton.css';

interface Props {
    concept: Concept;
}

interface State {
    DOMRect?: DOMRect;
    showInfoBox: boolean;
}

const className = 'concept-tree-learn-more'

export default class LearnMoreButton extends React.PureComponent<Props,State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            showInfoBox: false
        }
    }

    public handleClick = (e: any) => { 
        if (e.target.className === e.currentTarget.className || !this.state.showInfoBox) {
            const domRect: DOMRect = e.target.getBoundingClientRect();
            this.setState({ showInfoBox: !this.state.showInfoBox, DOMRect: domRect });
        }
    }

    public handleInfoBoxClickedOutside = () => {
        this.setState({ showInfoBox: !this.state.showInfoBox });
    }

    public render(): any {
        const { concept } = this.props;
        const countsByYear = concept.uiDisplayPatientCountByYear;
        const height = 250;
        const margin = {top: 20, right: 20, left: 20, bottom: 20};
        const minWidth = 200;
        const calcWidth = countsByYear ? (countsByYear.length * 40) : 200;
        const width = calcWidth < minWidth ? minWidth : calcWidth;
        const formatterThreshold = 10000;
        const data = countsByYear
            ? countsByYear!
                .map((p: PatientCountPerYear) => ({ ...p, label: p.patientCount >= formatterThreshold 
                    ? formatLargeNumber(p.patientCount)
                    : formatSmallNumber(p.patientCount)
                }))
            : countsByYear;

        return (
            <span className={`${className}-button`} onClick={this.handleClick}>
                <FiBarChart2 />
                <div>
                    Learn More
                    {this.state.showInfoBox &&
                    <PopupBox 
                        parentDomRect={this.state.DOMRect!} 
                        toggle={this.handleInfoBoxClickedOutside}>
                        <div className={`${className}`}>
                            <div className={`${className}-title`}>
                                <p>{concept.uiDisplayName}</p>
                                <p className={`${className}-universalid`}>
                                    {concept.universalId
                                        ? <span className={`${className}-universalid-value`}>{concept.universalId}</span> 
                                        : <span className={`${className}-universalid-none`}>local concept only</span> 
                                    }
                                </p>
                            </div>
                            <div className={`${className}-separator`} />
                            {countsByYear &&
                            <ResponsiveContainer height={height}>
                            <BarChart 
                                data={data} 
                                barCategoryGap={1} 
                                className={`${className}-chart`}
                                margin={margin}>
                                <XAxis 
                                    dataKey="year" 
                                    interval={0} 
                                    axisLine={false} 
                                    tickLine={false} 
                                    label={{ value: 'Unique patients by Year', position: 'bottom', className:`${className}-axis-label` }}/>
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
                            {countsByYear && <div className={`${className}-separator-long`} />}
                            {concept.uiDisplayTooltip &&
                            <div className={`${className}-info`}>
                                <textarea>{concept.uiDisplayText}</textarea>
                                {/* concept.uiDisplayTooltip
                                    .split('\n')
                                    .map((item: string, i: number) => {
                                        const c = item.indexOf('\t') > -1 ? `${className}-info-tab` : '';
                                        return <p className={c} key={i}>{item}</p>
                                    })
                                */}
                            </div>
                            }
                            {!concept.uiDisplayTooltip &&
                            <p className={`${className}-noinfo`}>
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
}