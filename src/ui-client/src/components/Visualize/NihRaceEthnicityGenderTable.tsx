/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { NihRaceEthnicityBuckets, EthnicBackgroundGenderMap } from '../../models/cohort/DemographicDTO';
import './NihRaceEthnicityGenderTable.css';

interface Props {
    data: NihRaceEthnicityBuckets;
}

export class NihRaceEthnicityGenderTable extends React.PureComponent<Props> {
    private className = 'visualization-nih';
    
    public render() {
        const { ethnicBackgrounds } = this.props.data;
        const c = this.className;
        const header = this.renderHeader();
        const [ footer, total ] = this.renderFooter(ethnicBackgrounds) as any;

        return (
            <div className={`${c}-container`}>
                <table className={`${c}-table`}>
                    
                    {/* Header */}
                    {header}

                    {/* Body */}
                    <tbody>
                        {Object.keys(ethnicBackgrounds).sort().map((key) => {
                            const eb = ethnicBackgrounds[key];
                            return (
                                <tr>
                                    <td>{key}</td>
                                    <td className={this.proportionToClass(eb.notHispanic.females, total)}>{eb.notHispanic.females.toLocaleString()}</td>
                                    <td className={this.proportionToClass(eb.notHispanic.males, total)}>{eb.notHispanic.males.toLocaleString()}</td>
                                    <td className={this.proportionToClass(eb.hispanic.females, total)}>{eb.hispanic.females.toLocaleString()}</td>
                                    <td className={this.proportionToClass(eb.hispanic.males, total)}>{eb.hispanic.males.toLocaleString()}</td>
                                    <td>{(eb.notHispanic.females + eb.notHispanic.males + eb.hispanic.females + eb.hispanic.males).toLocaleString()}</td>
                                </tr>
                            );
                        })}
                    </tbody>

                    {/* Footer */}
                    {footer}
                </table>
            </div>
        );
    }
    private proportionToClass = (num: number, denom: number) => {
        if (num === 0)  { return 'none'; }

        const pct = (num / (denom * 1.0)) * 100;
        if (pct < 2.5)  { return 'level-1'; }
        if (pct < 5.0)  { return 'level-2'; }
        if (pct < 7.5)  { return 'level-3'; }
        if (pct < 10.0) { return 'level-4'; }
        if (pct < 12.5) { return 'level-5'; }
        if (pct < 15.0) { return 'level-6'; }
        if (pct < 17.5) { return 'level-7'; }
        return 'level-8';
    }

    private renderHeader = () => {
        return (
            <thead>
                <tr>
                    <th rowSpan={2} className='left-col nih-border-bottom'>Heritage</th>
                    <th colSpan={2} className='nih-border-left nih-border-right'>Not Hispanic or Latino</th>
                    <th colSpan={2} className='nih-border-left nih-border-right'>Hispanic or Latino</th>
                    <th rowSpan={2} className='nih-border-bottom'>Total</th>
                </tr>
                <tr>
                    <th className='nih-border-left nih-border-bottom'>Female</th>
                    <th className='nih-border-right nih-border-bottom'>Male</th>
                    <th className='nih-border-bottom'>Female</th>
                    <th className='nih-border-right nih-border-bottom'>Male</th>
                </tr>
            </thead>
        );
    }

    private renderFooter = (ethnicBackgrounds: EthnicBackgroundGenderMap) => {
        const arr = Object.keys(ethnicBackgrounds).map((key) => ethnicBackgrounds[key]);
        const nonHispFem = arr.reduce((pv, cv) => pv + cv.notHispanic.females, 0);
        const nonHispMen = arr.reduce((pv, cv) => pv + cv.notHispanic.males, 0);
        const hispFem    = arr.reduce((pv, cv) => pv + cv.hispanic.females, 0);
        const hispMen    = arr.reduce((pv, cv) => pv + cv.hispanic.males, 0);
        const total      = nonHispFem + nonHispMen + hispFem + hispMen;

        return ([
            <tfoot>
                <tr>
                    <td>Total</td>
                    <td>{nonHispFem.toLocaleString()}</td>
                    <td>{nonHispMen.toLocaleString()}</td>
                    <td>{hispFem.toLocaleString()}</td>
                    <td>{hispMen.toLocaleString()}</td>
                    <td>{total.toLocaleString()}</td>
                </tr>
            </tfoot>,
            total
        ]);
    }
}