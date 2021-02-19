/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { CohortTimelinesAction } from "../../actions/cohort/timelines";
import { ConceptId } from "../../models/concept/Concept";
import { PanelItem } from "../../models/panel/PanelItem";
import { CohortState, CohortStateType, TimelinesNetworkState, TimelinesState } from "../../models/state/CohortState";
import { DateDisplayMode, DateIncrementType, TimelinesDisplayMode } from "../../models/timelines/Configuration";

export const defaultNetworkTimelinesState = (): TimelinesNetworkState => {
    return {
        indexConceptState: CohortStateType.NOT_LOADED,
        cohortStateByConcept: new Map<string, CohortStateType>(),
    };
};

export const defaultTimelinesState = (): TimelinesState => {
    return {
        aggregateData: { concepts: new Map() },
        configuration: {
            dateIncrement: {
                increment: 30,
                incrementType: DateIncrementType.DAY,
                mode: DateDisplayMode.AFTER
            },
            mode: TimelinesDisplayMode.AGGREGATE,
            panels: new Map()
        },
        patientData: [],
        indexConceptState: CohortStateType.NOT_LOADED,
        state: CohortStateType.NOT_LOADED
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
    // Set all network responders to REQUESTING if
    // query just started.
    const concept = action.panel!.subPanels[0].panelItems[0].concept;
    if (type === CohortStateType.REQUESTING) {
        state.networkCohorts.forEach((nr) => {
            nr.timelines.cohortStateByConcept.set(concept!.id, type);
        })
    }

    return Object.assign({}, state, {
        networkCohorts: new Map(state.networkCohorts),
        timelines: {
            ...state.timelines,
            state: type
        }
    });
};

export const setTimelinesNetworkConceptDataset = (state: CohortState, type: CohortStateType, action: CohortTimelinesAction): CohortState => {
    const network = Object.assign({}, state.networkCohorts.get(action.id!)!);
    const concept = action.panel!.subPanels[0].panelItems[0].concept;
    network.timelines.cohortStateByConcept.set(concept!.id, type);
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
    return Object.assign({}, state, { 
        networkCohorts: new Map(state.networkCohorts) 
    });
};

export const setTimelinesPanelIndexId = (state: CohortState, action: CohortTimelinesAction): CohortState => {
    return Object.assign({}, state, {
        timelines: {
            ...state.timelines,
            configuration: {
                ...state.timelines.configuration,
                indexPanel: action.indexPanel
            }
        }
    });
};

export const setTimelinesConfiguration = (state: CohortState, action: CohortTimelinesAction): CohortState => {
    return Object.assign({}, state, {
        timelines: {
            ...state.timelines,
            configuration: {
                ...state.timelines.configuration,
                ...action.config
            }
        }
    });
};

export const removeTimelinesConceptDataset = (state: CohortState, action: CohortTimelinesAction): CohortState => {
    const concept = action.panel!.subPanels[0].panelItems[0].concept;
    state.networkCohorts.forEach((nr) => {
        nr.timelines.cohortStateByConcept.delete(concept!.id);
    })

    return Object.assign({}, state, {
        timelines: {
            ...state.timelines
        }
    });
};