/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import Axios, { CancelTokenSource }  from 'axios';
import { Dispatch } from 'redux';
import { AppState } from '../../models/state/AppState';
import { CohortStateType, PatientCountState } from '../../models/state/CohortState';
import { PatientCountDTO } from '../../models/PatientCountDTO';
import { DemographicDTO, DemographicStatistics } from '../../models/cohort/DemographicDTO';
import { NetworkIdentity, NetworkResponderMap } from '../../models/NetworkResponder';
import { panelToDto } from '../../models/panel/Panel';
import { PanelFilter } from '../../models/panel/PanelFilter';
import { aggregateStatistics } from '../../services/cohortAggregatorApi';
import { fetchCount, fetchDemographics } from '../../services/cohortApi';
import { clearPreviousPatientList } from '../../services/patientListApi';
import { formatMultipleSql } from '../../utils/formatSql';
import { getPatientListFromNewBaseDataset, getPatientListDataset, setPatientListCustomColumnNames } from './patientList';
import { setAggregateVisualizationData, setNetworkVisualizationData } from './visualize';
import { showInfoModal } from '../generalUi';
import { InformationModalState } from '../../models/state/GeneralUiState';
import { panelHasLocalOnlyConcepts } from '../../utils/panelUtils';
import { allowAllDatasets } from '../../services/datasetSearchApi';
import { clearAllTimelinesData } from '../../services/timelinesApi';
import { setDatasetSearchResult, setDatasetSearchTerm } from '../datasets';
import { sleep } from '../../utils/Sleep';

export const REGISTER_NETWORK_COHORTS = 'REGISTER_NETWORK_COHORTS';
export const COHORT_COUNT_SET = 'COHORT_COUNT_SET';
export const COHORT_COUNT_START = 'COHORT_COUNT_START';
export const COHORT_COUNT_FINISH = 'COHORT_COUNT_FINISH';
export const COHORT_COUNT_ERROR = 'COHORT_COUNT_ERROR';
export const COHORT_COUNT_CANCEL = 'COHORT_COUNT_CANCEL';
export const COHORT_COUNT_NOT_IMPLEMENTED = 'COHORT_COUNT_NOT_IMPLEMENTED';
export const COHORT_DEMOGRAPHICS_START = 'COHORT_DEMOGRAPHICS_START';
export const COHORT_DEMOGRAPHICS_FINISH = 'COHORT_DEMOGRAPHICS_FINISH';
export const COHORT_DEMOGRAPHICS_SET = 'COHORT_DEMOGRAPHICS_SET';
export const COHORT_DEMOGRAPHICS_ERROR = 'COHORT_DEMOGRAPHICS_ERROR';

export interface CohortCountAction {
    id: number;
    cached?: boolean;
    cancel?: CancelTokenSource;
    cohorts?: NetworkIdentity[];
    countResults?: PatientCountState;
    responders?: NetworkResponderMap;
    responder?: NetworkIdentity;
    success?: boolean;
    error?: string;
    type: string;
}

/*
 * Request counts of patients from all enabled nodes, in parallel.
 * If a result comes back after query is cancelled, it is discarded.
 */
export const getCounts = () => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        let atLeastOneSucceeded = false;
        let atleastOneCached = false;
        const state = getState();
        const runLocalOnly = panelHasLocalOnlyConcepts(state.panels, state.panelFilters);
        const cancelSource = Axios.CancelToken.source();
        const panels = state.panels.map(p => panelToDto(p));
        const panelFilters = state.panelFilters.filter((pf: PanelFilter) => pf.isActive);
        const responders: NetworkIdentity[] = [];
        state.responders.forEach((nr: NetworkIdentity) => { 
            if (nr.enabled && (nr.isHomeNode || !runLocalOnly)) { 
                responders.push(nr); 
            } 
        });
        dispatch(setCohortCountStarted(state.responders, cancelSource));

        // Clear patient list & timeline data
        await clearPreviousPatientList();
        await clearAllTimelinesData();

        // Wrap entire query action in Promise.all
        Promise.all(
            // For each enabled responder
            responders.map((nr: NetworkIdentity, i: number) => { 
                return new Promise( async(resolve, reject) => {
                    let queryId = state.cohort.networkCohorts.get(nr.id)!.count.queryId;

                    // Request counts
                    fetchCount(getState(), nr, panelFilters, panels, queryId, cancelSource)
                        .then(
                            response => {
                                // Make sure query hasn't been cancelled
                                if (getState().cohort.count.state !== CohortStateType.REQUESTING) { return; }

                                // Update state count
                                const countDataDto = response.data as PatientCountDTO;

                                const countData: PatientCountState = {
                                    ...countDataDto.result,
                                    cached: countDataDto.cached,
                                    queryId: countDataDto.queryId,
                                    sqlStatements: [ formatMultipleSql(countDataDto.result.sqlStatements) ],
                                    state: CohortStateType.LOADED
                                }
                                queryId = countData.queryId;
                                atLeastOneSucceeded = true;
                                atleastOneCached = countData.cached === true ? true : atleastOneCached;
                                dispatch(setNetworkCohortCount(nr.id, countData));
                                
                        },  error => {
                            if (getState().cohort.count.state !== CohortStateType.REQUESTING) { return; }

                            if (error.response && error.response.status === 400) {
                                dispatch(setNetworkCohortCountNotImplemented(nr.id))
                            } else {
                                dispatch(errorNetworkCohortCount(nr.id, error.response));
                            }
                        })
                        .then(() => resolve(null));
                })
            })                
        ).then( async () => {

            if (getState().cohort.count.state !== CohortStateType.REQUESTING) { return; }
            dispatch(setCohortCountFinished(atLeastOneSucceeded, atleastOneCached));

            if (atLeastOneSucceeded) {
                const visibleDatasets = await allowAllDatasets();
                dispatch(setDatasetSearchResult(visibleDatasets));
                dispatch(setDatasetSearchTerm(''));
            } else {
                const info : InformationModalState = {
                    header: "Error Running Query",
                    body: "Leaf encountered an error while running your query. If this continues, please contact your Leaf administrator.",
                    show: true
                }
                dispatch(showInfoModal(info));
            }
        });
    };
};

/*
 * Request demograhics of patients from all enabled nodes, in parallel.
 * If a result comes back after query is cancelled, it is discarded.
 * Results are used to populate both the Visualize and Patient List components.
 */
const getDemographics = () => {
    return async (dispatch: any, getState: () => AppState) => {
        const state = getState();
        const cancelSource = Axios.CancelToken.source();
        const responders: NetworkIdentity[] = [];
        const defaultDatasets = [ ...state.datasets.all.values() ].filter(ds => ds.isDefault);
        let atLeastOneSucceeded = false;
        state.responders.forEach((nr: NetworkIdentity) => { 
            if (state.cohort.networkCohorts.get(nr.id)!.count.state === CohortStateType.LOADED && !nr.isGateway) { 
                responders.push(nr); 
            } 
        });
        dispatch(setCohortDemographicsStarted(state.responders, cancelSource));

        await Promise.all(
            // For each enabled responder
            responders.map((nr: NetworkIdentity, i: number) => { 
                return new Promise( async (resolve, reject) => {
                    const queryId = state.cohort.networkCohorts.get(nr.id)!.count.queryId;

                    // Request demogaphics
                    fetchDemographics(getState(), nr, queryId, cancelSource)
                        .then(
                            async demResponse => {
                                
                                // Make sure query hasn't been reset
                                if (getState().cohort.count.state !== CohortStateType.LOADED) { return; }
                                atLeastOneSucceeded = true;
                                const demographics = demResponse.data as DemographicDTO;

                                dispatch(setNetworkVisualizationData(nr.id, demographics.statistics));
                                getPatientListFromNewBaseDataset(nr.id, demographics.patients, dispatch, getState);

                                if (demographics.columnNames) {
                                    dispatch(setPatientListCustomColumnNames(nr.id, new Map(Object.entries(demographics.columnNames))));
                                }

                                const newState = getState();
                                const aggregate = await aggregateStatistics(newState.cohort.networkCohorts, newState.responders) as DemographicStatistics;
                                dispatch(setAggregateVisualizationData(aggregate));
                        },  error => {
                            if (getState().cohort.count.state !== CohortStateType.LOADED) { return; }
                            dispatch(errorNetworkCohortDemographics(nr.id, error.response));
                        })
                        .then(() => resolve(null));
                })
            })
        // Set cohort state to LOADED            
        ).then(() => {
            if (getState().cohort.count.state !== CohortStateType.LOADED) { return; }
            if (atLeastOneSucceeded) {
                dispatch(setCohortDemographicsFinished());
            } else {
                dispatch(setCohortDemographicsErrored());
            }
        });

        // Auto-load any other `default` datasets
        for (const ds of defaultDatasets) {
            // Hack: redux `dispatch()` isn't async, so we can't await it,
            // but we also don't want to overwhelm the server with a lot of potential parallel
            // requests. Thus poll every half second to infer that previous dataset completed,
            // then execute
            while (getState().cohort.patientList.configuration.isFetching) {
                await sleep(500);
            }
            dispatch(getPatientListDataset(ds));
        }
        console.log(getState().cohort.patientList.configuration.customColumnNames);
    };
};

// Synchronous
export const getDemographicsIfNeeded = () => {
    return (dispatch: Dispatch<any>, getState: () => AppState) => {
        const state = getState();
        if (state.cohort.count.state === CohortStateType.LOADED && 
            state.cohort.patientList.state === CohortStateType.NOT_LOADED &&
            (
                (state.cohort.networkCohorts.size === 1 && state.cohort.count.value <= state.auth.config!.cohort.cacheLimit) ||
                (state.cohort.networkCohorts.size > 1) ||
                (state.cohort.networkCohorts.size === 1 && state.cohort.count.value > state.auth.config!.cohort.lowCellMaskingThreshold)
            )
        ) {
            dispatch(getDemographics());
        }
    };
};

export const cancelQuery = () => {
    return {
        id: 0,
        type: COHORT_COUNT_CANCEL
    };
};

export const registerNetworkCohorts = (responders: NetworkIdentity[]) : CohortCountAction => {
    return {
        cohorts: responders,
        id: 0,
        type: REGISTER_NETWORK_COHORTS
    };
};

export const setNetworkCohortCount = (id: number, countResults: PatientCountState): CohortCountAction => {
    return {
        countResults,
        id,
        type: COHORT_COUNT_SET
    };
};

export const setCohortCountStarted = (responders: NetworkResponderMap, cancel: CancelTokenSource): CohortCountAction => {
    return {
        cancel,
        id: 0,
        responders,
        type: COHORT_COUNT_START
    };
};

export const setCohortCountFinished = (success: boolean, cached: boolean): CohortCountAction => {
    return {
        id: 0,
        success,
        cached,
        type: COHORT_COUNT_FINISH
    };
} 

export const errorNetworkCohortCount = (id: number, error: string): CohortCountAction => {
    return {
        error,
        id,
        type: COHORT_COUNT_ERROR
    };
};

export const setNetworkCohortCountNotImplemented = (id: number): CohortCountAction => {
    return {
        id,
        type: COHORT_COUNT_NOT_IMPLEMENTED
    };
};

export const setNetworkCohortDemographics = (id: number, countResults: PatientCountState): CohortCountAction => {
    return {
        countResults,
        id,
        type: COHORT_DEMOGRAPHICS_SET
    };
};

export const setCohortDemographicsStarted = (responders: NetworkResponderMap, cancel: CancelTokenSource): CohortCountAction => {
    return {
        cancel,
        id: 0,
        responders,
        type: COHORT_DEMOGRAPHICS_START
    };
};

export const setCohortDemographicsFinished = (): CohortCountAction => {
    return {
        id: 0,
        type: COHORT_DEMOGRAPHICS_FINISH
    };
};

export const setCohortDemographicsErrored = (): CohortCountAction => {
    return {
        id: 0,
        type: COHORT_DEMOGRAPHICS_ERROR
    };
};

export const errorNetworkCohortDemographics = (id: number, error: string): CohortCountAction => {
    return {
        error,
        id,
        type: COHORT_DEMOGRAPHICS_ERROR
    };
};