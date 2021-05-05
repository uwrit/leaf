/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { PatientCountState, CohortStateType } from '../../models/state/CohortState';
import { NetworkIdentity } from '../../models/NetworkResponder';
import CohortSql from './CohortSql';
import LoaderIcon from '../Other/LoaderIcon/LoaderIcon';
import 'ace-builds/src-noconflict/mode-sqlserver';
import 'ace-builds/src-noconflict/theme-sqlserver';

export interface SiteCountDetail {
    countResults: PatientCountState;
    id: NetworkIdentity;
}

interface Props {
    data: SiteCountDetail;
    max: number;
}

interface State {
    DOMRect?: DOMRect;
    showSql: boolean;
}

export class CohortCountSiteDetail extends React.PureComponent<Props, State> {
    private className = 'cohort-count-site';
    constructor(props: Props) {
        super(props);
        this.state = {
            showSql: false
        }
    }

    public toggleSql = () => {
        this.setState({ showSql: !this.state.showSql });
    }

    public handleClickShowSql = (e: any) => { 
        if (e.target.className === e.currentTarget.className || !this.state.showSql) {
            const domRect: DOMRect = e.target.getBoundingClientRect();
            this.setState({ showSql: !this.state.showSql, DOMRect: domRect });
        }
    }

    public render() {
        const { max, data } = this.props;
        const { value, state } = data.countResults;
        const { showSql } = this.state;
        const xMax = max * 1.8;
        const complete = state === CohortStateType.LOADED;
        const containerWidth = 160;
        const width = complete ? (value / xMax * containerWidth) : 0;
        const numLeftMargin = width + 4;
        const c = this.className;

        return (
            <div className={`${c}-detail`}>

                {/* Site name and SQL/Error/NA test */}
                <div className={`${c}-text`}>
                    <div className={`${c}-text-name`}>{data.id.abbreviation}</div>
                    {this.getStateDependentContent()}
                </div>

                {/* (SQL) button */}
                {complete && showSql &&
                    <CohortSql data={data} toggle={this.toggleSql} DOMRect={this.state.DOMRect} />
                }

                {/* Value bar and value */}
                <div className={`${c}-bar-container`}>
                    <div className={`${c}-bar`} style={{ width, backgroundColor: data.id.primaryColor }} />
                    <div className={`${c}-num`} style={{ marginLeft: numLeftMargin }}>{this.getTrailingText(complete, data.countResults)}</div>
                </div>

        </div>
        );
    }

    private getTrailingText = (complete: boolean, results: PatientCountState) => {
        const { value, withinLowCellThreshold, plusMinus } = results;

        if (!complete) { return ''; }
        const val = value.toLocaleString();
        if (withinLowCellThreshold) { return `${val} or less`; }
        else if (plusMinus > 0)     { return `${val} +/- ${plusMinus}`; }
        return val;
    }

    private getStateDependentContent = () => {
        const { state } = this.props.data.countResults;
        const c = this.className;

        switch (state) {
            case CohortStateType.REQUESTING:
                return <LoaderIcon size={15} />;
            case CohortStateType.IN_ERROR:
                return <div className={`${c}-text-error`}>error!</div>;
            case CohortStateType.NOT_IMPLEMENTED:
                return <div className={`${c}-text-na`}>Query NA</div>;
            case CohortStateType.LOADED:
                return <div className={`${c}-text-sql`} onClick={this.handleClickShowSql}>SQL</div>;
        }
        return null;
    };
}

