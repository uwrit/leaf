/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Link } from 'react-router-dom';
import { DemographicRow } from '../../../models/cohortData/DemographicDTO';

interface Props {
    cohortId: string;
    hints: DemographicRow[];
    selectedHintIndex: number;
}

export default class HintContainer extends React.PureComponent<Props> {
    private className = 'patient-search';
    
    public render() {
        const { selectedHintIndex, hints, cohortId } = this.props;
        const c = this.className;

        return (
            <div className={`${c}-hint-container`}>

                {hints.map((hint, i) => {
                    return (
                        <Link key={hint.personId} to={`/${cohortId}/patients/${hint.personId}`}>
                            <div 
                                className={`${c}-hint-item leaf-dropdown-item ${i === selectedHintIndex ? 'selected' : ''}`} 
                                key={hint.personId}
                                >
                                    <span className={`${c}-hint-name`}>{hint.name} </span>
                                    <span className={`${c}-hint-mrn`}>{hint.mrn}</span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        );
    }
};