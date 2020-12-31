/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { CohortTimelinesAction } from "../../actions/cohort/timelines";
import { CohortState, CohortStateType, TimelinesNetworkState, TimelinesState } from "../../models/state/CohortState";
import { DateDisplayMode, DateIncrementType, TimelinesDisplayMode } from "../../models/timelines/Configuration";

export const defaultNetworkTimelinesState = (): TimelinesNetworkState => {
    return {
        indexConceptState: CohortStateType.NOT_LOADED,
        stateByConcept: new Map<string, CohortStateType>()
    };
};

export const defaultTimelinesState = (): TimelinesState => {
    return {
        aggregateData: { concepts: new Map() },
        configuration: {
            concepts: [],
            dateIncrement: {
                increment: 30,
                incrementType: DateIncrementType.DAY,
                mode: DateDisplayMode.AFTER
            },
            mode: TimelinesDisplayMode.AGGREGATE
        },
        patientData: [],
        indexConceptState: CohortStateType.NOT_LOADED,
        stateByConcept: new Map<string, CohortStateType>()
    };
};

export const setTimelinesAggregateDataset = (state: CohortState, action: CohortTimelinesAction): CohortState => {
    return Object.assign({}, state, {
        timelines: {
            ...state.timelines,
            aggregateData: action.aggregateDataset!
        }
    });
};

export const setTimelinesConceptDatasetState = (state: CohortState, type: CohortStateType, action: CohortTimelinesAction): CohortState => {
    const stateByConcept = new Map(state.timelines.stateByConcept);
    stateByConcept.set(action.concept!.id, type);

    // Set all network responders to REQUESTING if
    // query just started.
    if (type === CohortStateType.REQUESTING) {
        state.networkCohorts.forEach((nr) => {
            nr.timelines.stateByConcept.set(action.concept!.id, type);
        })
    }

    return Object.assign({}, state, {
        timelines: {
            ...state.timelines,
            stateByConcept
        }
    });
};

export const setTimelinesNetworkConceptDataset = (state: CohortState, type: CohortStateType, action: CohortTimelinesAction): CohortState => {
    const network = Object.assign({}, state.networkCohorts.get(action.id!)!);
    network.timelines.stateByConcept.set(action.concept!.id, type);
    state.networkCohorts.set(action.id!, network);
    return Object.assign({}, state);
};

export const setTimelinesPanelDatasetState = (state: CohortState, type: CohortStateType, action: CohortTimelinesAction): CohortState => {
    // Set all network responders to REQUESTING if
    // query just started.
    if (type === CohortStateType.REQUESTING) {
        state.networkCohorts.forEach((nr) => {
            nr.timelines.indexConceptState = type;
        })
    }

    return Object.assign({}, state, {
        timelines: {
            ...state.timelines,
            indexConceptState: type
        }
    });
};

export const setTimelinesNetworkPanelDataset = (state: CohortState, type: CohortStateType, action: CohortTimelinesAction): CohortState => {
    const network = Object.assign({}, state.networkCohorts.get(action.id!)!);
    network.timelines.indexConceptState = type;
    state.networkCohorts.set(action.id!, network);
    return Object.assign({}, state);
};
