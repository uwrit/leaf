/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { CohortStateType } from '../../models/state/CohortState';

interface Props { 
    countState: CohortStateType;
}

interface State {
    elapsed: number;
}

let timer: NodeJS.Timer;
const interval = 100;
const increment = interval / 1000.0;

export class CohortCountQueryTimer extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.tick = this.tick.bind(this);
        this.state = { elapsed: 0 }
    }

    public tick() {
        this.setState({ elapsed: this.state.elapsed + increment });
    }

    public getSnapshotBeforeUpdate (prevProps: Props): any {
        const prevState = prevProps.countState;
        const currState = this.props.countState; 

        if (prevState === currState) {
            return null;
        }
        else if (prevState === CohortStateType.REQUESTING && currState !== prevState) {            
            clearInterval(timer);
        }
        else if (prevState !== CohortStateType.REQUESTING && currState === CohortStateType.REQUESTING) {
            this.setState(
                { elapsed: 0 }, 
                () => timer = setInterval(this.tick, interval)
            );
        }
        return null;
    }

    public componentDidUpdate() { return; }

    public render() {
        const secondsDisplay = this.state.elapsed.toFixed(1); 
        return (
            <div className="cohort-count-detail-seconds">
                <span>
                    {secondsDisplay} seconds elapsed
                </span>
            </div>
        );
    }
}
