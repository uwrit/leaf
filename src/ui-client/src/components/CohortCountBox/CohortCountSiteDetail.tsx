/* Copyright (c) 2019, UW Medicine Research IT
 * Developed by Nic Dobbins and Cliff Spital
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Bar, BarChart, LabelList, XAxis, YAxis } from 'recharts';
import { PatientCountState, CohortStateType } from '../../models/state/CohortState';
import { NetworkIdentity } from '../../models/NetworkRespondent';
import CohortSql from './CohortSql';

import 'brace/mode/sqlserver';
import 'brace/theme/sqlserver';
import LoaderIcon from '../Other/LoaderIcon/LoaderIcon';

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
        const displayData = [ { ...data, value: data.countResults.value, label: data.countResults.value.toLocaleString() } ];
        const xMax = max * 1.5;
        const c = this.className;
        const inProgress = data.countResults.state === CohortStateType.REQUESTING;
        const complete = data.countResults.state === CohortStateType.LOADED;
        const inError = data.countResults.state === CohortStateType.IN_ERROR;
        const couldntRunQuery = data.countResults.state === CohortStateType.NOT_IMPLEMENTED;

        return (
            <div className={`${c}-detail`}>
                <div className={`${c}-text`}>
                    <div className={`${c}-text-name`}>{data.id.abbreviation}</div>
                    {complete &&
                    <div className={`${c}-text-sql`} onClick={this.handleClickShowSql}>SQL</div>
                    }
                    {inProgress &&
                    <LoaderIcon size={15} />
                    }
                    {inError &&
                    <div className={`${c}-text-error`}>error!</div>
                    }
                    {couldntRunQuery &&
                    <div className={`${c}-text-na`}>Query NA</div>
                    }
                </div>
                {complete && 
                <div className={`${c}-bar`}>
                    <BarChart data={displayData} layout="vertical" height={25} width={160}>
                        <XAxis type="number" hide={true} domain={[0, xMax]} />
                        <YAxis type="category" dataKey="id" hide={true}/>
                        <Bar dataKey="value" fill={data.id.primaryColor} isAnimationActive={false}>
                            <LabelList dataKey="label" position="right" />
                        </Bar>
                    </BarChart>
                </div>
                }
                {complete && this.state.showSql &&
                <CohortSql 
                    data={data}
                    toggle={this.toggleSql} 
                    DOMRect={this.state.DOMRect} />
                }
            </div>
        );
    }
}

