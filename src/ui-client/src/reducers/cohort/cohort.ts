/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { 
    COHORT_COUNT_CANCEL, 
    COHORT_COUNT_ERROR, 
    COHORT_COUNT_FINISH, 
    COHORT_COUNT_SET,
    COHORT_COUNT_START,
    COHORT_COUNT_NOT_IMPLEMENTED,
    COHORT_DEMOGRAPHICS_ERROR,
    COHORT_DEMOGRAPHICS_FINISH,
    COHORT_DEMOGRAPHICS_SET,
    COHORT_DEMOGRAPHICS_START,
    CohortCountAction,
    REGISTER_NETWORK_COHORTS
} from '../../actions/cohort/count';
import { 
    CohortPatientListAction,
    PATIENT_LIST_INTERACT_DISABLED,
    PATIENT_LIST_SINGLETON_RECEIVED,
    PATIENTLIST_COLUMN_TOGGLE,
    PATIENTLIST_SET_PAGINATION,
    SET_PATIENT_LIST_DISPLAY,
    PATIENT_LIST_DATASET_FAILURE,
    PATIENT_LIST_DATASET_RECEIVED,
    PATIENT_LIST_NETWORK_DATASET_RECEIVED,
    PATIENT_LIST_DATASET_REQUESTED,
    PATIENT_LIST_DATASET_NOT_IMPLEMENTED
} from '../../actions/cohort/patientList';
import { 
    CohortVisualizationAction,
    VISUALIZATION_SET_AGGREGATE,
    VISUALIZATION_SET_NETWORK
} from '../../actions/cohort/visualize';

import {
    TIMELINES_CONCEPT_DATASET_START,
    TIMELINES_CONCEPT_DATASET_FINISH,
    TIMELINES_CONCEPT_DATASET_NETWORK_DATASET,
    TIMELINES_CONCEPT_DATASET_NETWORK_ERROR,
    TIMELINES_CONCEPT_DATASET_NETWORK_NOT_IMPLEMENTED,
    TIMELINES_INDEX_DATASET_START,
    TIMELINES_INDEX_DATASET_FINISH,
    TIMELINES_INDEX_DATASET_NETWORK_DATASET,
    TIMELINES_INDEX_DATASET_NETWORK_ERROR,
    TIMELINES_INDEX_DATASET_NETWORK_NOT_IMPLEMENTED,
    TIMELINES_SET_AGGREGATE_DATASET,
    TIMELINES_SET_CONFIG,
    TIMELINES_INDEX_SET_PANEL_ID,
    TIMELINES_REMOVE_CONCEPT_DATASET
} from '../../actions/cohort/timelines';
import { DISABLE_RESPONDER, ENABLE_RESPONDER } from '../../actions/networkResponders';
import { SET_PANEL_FILTERS, TOGGLE_PANEL_FILTER } from '../../actions/panelFilter';
import { 
    ADD_PANEL_ITEM, 
    REMOVE_PANEL_ITEM,
    RESET_PANELS,
    SET_PANEL_DATE_FILTER,
    SET_PANEL_INCLUSION,
    SET_PANEL_ITEM_NUMERIC_FILTER,
    SET_SUBPANEL_INCLUSION,
    SET_SUBPANEL_JOIN_SEQUENCE,
    SET_SUBPANEL_MINCOUNT,
    SELECT_CONCEPT_SPECIALIZATION,
    DESELECT_CONCEPT_SPECIALIZATION
 } from '../../actions/panels';
import { CohortState, CohortStateType, NetworkCohortState } from '../../models/state/CohortState';
import { defaultCountState, errorCohortCount, recalculateCohortCount, setNetworkCohortCount, cohortCountNotImplemented } from './count';
import { 
    defaultNetworkPatientListState, 
    defaultPatientListState, 
    setPagination, 
    setPatientList, 
    setPatientListNonInteractive, 
    setPatientListSingletonReceived, 
    toggleColumn,
    setNetworkPatientListDatasetFailure,
    setNetworkPatientListDatasetReceived,
    setPatientListDatasetReceived,
    setPatientListDatasetRequested,
    setNetworkPatientListDatasetNotImplemented
} from './patientList';
import { defaultVisualizationState, setAggregateCohortVisualization, setNetworkCohortVisualization } from './visualize';
import {
    OPEN_SAVED_QUERY
} from '../../actions/queries';
import { 
    defaultNetworkTimelinesState, 
    defaultTimelinesState, 
    setTimelinesNetworkConceptDataset, 
    setTimelinesConceptDatasetState, 
    setTimelinesPanelDatasetState, 
    setTimelinesNetworkPanelDataset, 
    setTimelinesAggregateDataset, 
    setTimelinesConfiguration, 
    setTimelinesPanelIndexId,
    removeTimelinesConceptDataset
} from './timelines';
import { SET_NOTE_DATASET_CHECKED, NoteSearchAction, SET_NOTE_DATASETS } from '../../actions/cohort/noteSearch';
import { setNoteDatasetChecked, setNoteDatasets, defaultNoteSearchState } from './noteSearch';

export const defaultCohortState = (): CohortState => {
    return {
        count: defaultCountState(),
        networkCohorts: new Map<number, NetworkCohortState>(),
        noteSearch: defaultNoteSearchState(),
        patientList: defaultPatientListState(),
        timelines: defaultTimelinesState(),
        visualization: defaultVisualizationState()
    };
};

const registerCohorts = (state: CohortState, action: CohortCountAction): CohortState => {
    const newState = Object.assign({}, state);
    for (const r of action.cohorts!) {
        const newCohort: NetworkCohortState = {
            count: defaultCountState(),
            id: r.id,
            timelines: defaultNetworkTimelinesState(),
            patientList: defaultNetworkPatientListState(),
            visualization: defaultVisualizationState()
        }
        newState.networkCohorts.set(r.id, newCohort)
    }
    return newState;
};

const cancelCountQuery = (state: CohortState): CohortState => {
    const stateClone = Object.assign({}, state);
    const cancelToken = stateClone.cancel;
    if (cancelToken) {
        cancelToken.cancel();
        console.log('query cancelled');
    }
    return resetCohorts(stateClone);
};

const resetCohorts = (state: CohortState): CohortState => {
    const network = new Map();
    state.networkCohorts.forEach((n: NetworkCohortState) => {
        const count = defaultCountState()
        const patientList = defaultNetworkPatientListState();
        const timelines = defaultNetworkTimelinesState();
        const visualization = defaultVisualizationState();
        network.set(n.id, Object.assign({}, n, { count, patientList, timelines, visualization }));
    });

    return Object.assign({}, state, {
        count: defaultCountState(),
        networkCohorts: network,
        patientList: defaultPatientListState(),
        timelines: defaultTimelinesState(),
        visualization: defaultVisualizationState()
    });
};

const startCountQuery = (state: CohortState, action: CohortCountAction): CohortState => {
    const network = new Map(state.networkCohorts);
    const responders = action.responders!;
    network.forEach((n: NetworkCohortState) => { 
        const resp = responders.get(n.id)!;
        const clone = Object.assign({}, n);
        clone.count = {
            ...defaultCountState(),
            state: resp.enabled ? CohortStateType.REQUESTING : CohortStateType.NOT_LOADED
        };
        network.set(n.id, clone); 
    });

    return Object.assign({}, state, {
        cancel: action.cancel!,
        count: {
            ...state.count,
            state: CohortStateType.REQUESTING,
            value: 0
        },
        networkCohorts: network
    }) as CohortState;
};

const finishCountQuery = (state: CohortState, action: CohortCountAction): CohortState => {
    return Object.assign({}, state, {
        count: {
            ...state.count,
            state: action.success ? CohortStateType.LOADED : CohortStateType.NOT_LOADED,
        }
    });
};

const startDemographicQuery = (state: CohortState, action: CohortCountAction): CohortState => {
    const network = new Map(state.networkCohorts);
    const responders = action.responders!;
    network.forEach((n: NetworkCohortState) => { 
        const resp = responders.get(n.id)!;
        const newState = resp.enabled ? CohortStateType.REQUESTING : CohortStateType.NOT_LOADED;
        const clone = Object.assign({}, n, {
            patientList: {
                ...defaultNetworkPatientListState(),
                state: newState
            }, 
            visualization: {
                ...defaultVisualizationState,
                state: newState
            }
        });
        network.set(n.id, clone); 
    });

    return Object.assign({}, state, {
        cancel: action.cancel!,
        networkCohorts: network,
        patientList: {
            ...defaultPatientListState(),
            state: CohortStateType.REQUESTING
        },
        visualization: {
            ...defaultVisualizationState,
            state: CohortStateType.REQUESTING
        }
    }) as CohortState;
};

const finishDemographicQuery = (state: CohortState): CohortState => {
    return Object.assign({}, state, {
        patientList: {
            ...state.patientList,
            state: CohortStateType.LOADED
        },
        visualization: {
            ...state.visualization,
            state: CohortStateType.LOADED
        }
    });
};

const errorCohortDemographics = (state: CohortState, action: CohortCountAction): CohortState => {
    const network = new Map(state.networkCohorts);

    /*
     * If it has an ID, then an individual node failed.
     */
    if (action.id) {
        const clone = Object.assign({}, network.get(action.id)!, {
            patientList: {
                ...defaultPatientListState(),
                state: CohortStateType.IN_ERROR
            },
            visualization: {
                ...defaultVisualizationState,
                state: CohortStateType.IN_ERROR
            }
        });
        network.set(clone.id, clone);
        return Object.assign({}, state, { networkCohorts: network }) as CohortState;
    /*
     * Else all nodes failed.
     */
    } else {
        return Object.assign({}, state, {
            patientList: {
                ...state.patientList,
                state: CohortStateType.IN_ERROR
            },
            visualization: {
                ...state.visualization,
                state: CohortStateType.IN_ERROR
            }
        }) as CohortState;
    };
};

type CohortAction = CohortCountAction | CohortVisualizationAction | CohortPatientListAction | NoteSearchAction;

export const cohort = (state: CohortState = defaultCohortState(), action: CohortAction): CohortState => {
    switch (action.type) {

        // Register Cohorts
        case REGISTER_NETWORK_COHORTS:
            return registerCohorts(state, action);

        // Counts
        case COHORT_COUNT_SET:
            return setNetworkCohortCount(state, action);
        case COHORT_COUNT_START:
            return startCountQuery(state, action);
        case COHORT_COUNT_FINISH:
            return finishCountQuery(state, action);
        case COHORT_COUNT_ERROR:
            return errorCohortCount(state, action);
        case COHORT_COUNT_CANCEL:
            return cancelCountQuery(state);
        case COHORT_COUNT_NOT_IMPLEMENTED:
            return cohortCountNotImplemented(state, action);

        // Demographics
        case COHORT_DEMOGRAPHICS_START:
            return startDemographicQuery(state, action);
        case COHORT_DEMOGRAPHICS_FINISH:
            return finishDemographicQuery(state);
        case COHORT_DEMOGRAPHICS_SET:
            return setNetworkCohortVisualization(state, action);
        case COHORT_DEMOGRAPHICS_ERROR:
            return errorCohortDemographics(state, action);

        // Visualizations
        case VISUALIZATION_SET_NETWORK:
            return setNetworkCohortVisualization(state, action);
        case VISUALIZATION_SET_AGGREGATE:
            return setAggregateCohortVisualization(state, action);

        // Timelines
        case TIMELINES_SET_CONFIG:
            return setTimelinesConfiguration(state, action);
        case TIMELINES_SET_AGGREGATE_DATASET:
            return setTimelinesAggregateDataset(state, action);
        case TIMELINES_REMOVE_CONCEPT_DATASET:
            return removeTimelinesConceptDataset(state, action);
        case TIMELINES_CONCEPT_DATASET_START:
            return setTimelinesConceptDatasetState(state, CohortStateType.REQUESTING, action);
        case TIMELINES_CONCEPT_DATASET_FINISH:
            return setTimelinesConceptDatasetState(state, CohortStateType.LOADED, action);
        case TIMELINES_CONCEPT_DATASET_NETWORK_DATASET:
            return setTimelinesNetworkConceptDataset(state, CohortStateType.LOADED, action);
        case TIMELINES_CONCEPT_DATASET_NETWORK_NOT_IMPLEMENTED:
            return setTimelinesNetworkConceptDataset(state, CohortStateType.NOT_IMPLEMENTED, action);
        case TIMELINES_CONCEPT_DATASET_NETWORK_ERROR:
            return setTimelinesNetworkConceptDataset(state, CohortStateType.IN_ERROR, action);         
        case TIMELINES_INDEX_SET_PANEL_ID:
            return setTimelinesPanelIndexId(state, action);
        case TIMELINES_INDEX_DATASET_START:
            return setTimelinesPanelDatasetState(state, CohortStateType.REQUESTING, action);
        case TIMELINES_INDEX_DATASET_FINISH:
            return setTimelinesPanelDatasetState(state, CohortStateType.LOADED, action);
        case TIMELINES_INDEX_DATASET_NETWORK_DATASET:
            return setTimelinesNetworkPanelDataset(state, CohortStateType.LOADED, action);
        case TIMELINES_INDEX_DATASET_NETWORK_NOT_IMPLEMENTED:
            return setTimelinesNetworkPanelDataset(state, CohortStateType.NOT_IMPLEMENTED, action);
        case TIMELINES_INDEX_DATASET_NETWORK_ERROR:
            return setTimelinesNetworkPanelDataset(state, CohortStateType.IN_ERROR, action);            

        // Note Search
        case SET_NOTE_DATASET_CHECKED:
            return setNoteDatasetChecked(state, action);
        case SET_NOTE_DATASETS:
            return setNoteDatasets(state, action);

        // Patient List
        case SET_PATIENT_LIST_DISPLAY:
            return setPatientList(state, action);
        case PATIENT_LIST_INTERACT_DISABLED:
            return setPatientListNonInteractive(state);
        case PATIENTLIST_COLUMN_TOGGLE:
            return toggleColumn(state, action);
        case PATIENTLIST_SET_PAGINATION:
            return setPagination(state, action);
        case PATIENT_LIST_SINGLETON_RECEIVED:
            return setPatientListSingletonReceived(state, action);
        case PATIENT_LIST_DATASET_REQUESTED:
            return setPatientListDatasetRequested(state, action);
        case PATIENT_LIST_DATASET_RECEIVED:
            return setPatientListDatasetReceived(state, action);
        case PATIENT_LIST_NETWORK_DATASET_RECEIVED:
            return setNetworkPatientListDatasetReceived(state, action);
        case PATIENT_LIST_DATASET_FAILURE:
            return setNetworkPatientListDatasetFailure(state, action);
        case PATIENT_LIST_DATASET_NOT_IMPLEMENTED:
            return setNetworkPatientListDatasetNotImplemented(state, action);

        // Enabled/disabling responders after data loaded
        case ENABLE_RESPONDER:
            return recalculateCohortCount(state, action.id, true);
        case DISABLE_RESPONDER:
            return recalculateCohortCount(state, action.id, false);

        // Any change to panel query definition resets the cohort
        case ADD_PANEL_ITEM:
        case REMOVE_PANEL_ITEM:
        case SET_PANEL_ITEM_NUMERIC_FILTER:
        case SET_PANEL_INCLUSION:
        case SET_PANEL_DATE_FILTER:
        case SET_SUBPANEL_INCLUSION:
        case SET_SUBPANEL_MINCOUNT:
        case SET_SUBPANEL_JOIN_SEQUENCE:
        case SET_PANEL_FILTERS:
        case TOGGLE_PANEL_FILTER:
        case RESET_PANELS:
        case SELECT_CONCEPT_SPECIALIZATION:
        case DESELECT_CONCEPT_SPECIALIZATION:
        case OPEN_SAVED_QUERY:
            return resetCohorts(state);
        
        default:
            return state;
    }
};
