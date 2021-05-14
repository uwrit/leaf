/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { sampleSize } from 'lodash';

interface Props { 
    data: any[];
}

export default class VisualizationDatasetSample extends React.PureComponent<Props> {
    private className = 'visualization-dataset-sample';
    private sampleN = 10;

    public render() {
        const c = this.className;
        const { data } = this.props;
        const fields = this.getFields();

        return (
            <div className={c}>
                <table>
                    <thead>
                        <tr>{fields.map(f => <th>{f}</th>)}</tr>
                    </thead>
                    <tbody>
                        {sampleSize(data, this.sampleN).map(d => {
                            return <tr>{fields.map(f => <td>{d[f]}</td>)}</tr>;
                        })}
                    </tbody>
                </table>
            </div>
        );
    }

    private getFields = (): string[] => {
        const { data } = this.props;
        const personId = 'personId';
        const fields = [ ...new Set(data.map(d => Object.keys(d)).flat()) ];
        if (fields.length > 1 && fields[fields.length-1] === personId) {
            fields.unshift(personId);
            fields.splice(fields.length-1, 1);
        }
        return fields;
    }
}