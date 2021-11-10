/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { DatasetsState } from "../models/state/AppState";
import { 
    DatasetAction, 
    SET_DATASET,
    SET_DATASETS,
    SET_DATASETS_SEARCH_TERM,
    SET_DATASETS_SEARCH_RESULT,
    REMOVE_DATASET,
    ADD_DATASET,
    MOVE_DATASET_CATEGORY,
    SET_DATASET_DISPLAY,
    SET_DATASET_SELECTED,
    SWITCH_DATASET_OLD_FOR_NEW
} from "../actions/datasets";
import { PatientListDatasetQuery, PatientListDatasetShape } from "../models/patientList/Dataset";

export const defaultDatasetsState = (): DatasetsState => {
    return {
        all: new Map(),
        display: new Map(),
        displayOrder: new Map(),
        searchTerm: '',
        selected: ''
    };
};

const demographics: PatientListDatasetQuery = { id: 'demographics', shape: PatientListDatasetShape.Demographics, category: '', isEncounterBased: false, name: 'Basic Demographics', tags: [] };

const switchDatasetOldForNew = (state: DatasetsState, action: DatasetAction): DatasetsState => {
    const oldDs = action.dataset!;
    const newDs = action.newDataset!;
    let cat: any;
    let datasets;
    let index = -1;
    let ord;

    /* 
     * Update [all].
     */
    state.all.delete(oldDs.id);
    state.all.set(newDs.id, newDs);

    /* 
     * Update [display].
     */
    cat = state.display.get(oldDs.category);
    if (cat) {
        datasets = [ ...cat.datasets.values() ];
        index = datasets.findIndex((ds) => ds.id === oldDs.id);
        if (index > -1) {
            datasets[index] = newDs;
            cat.datasets.clear();
            datasets.forEach((ds) => cat.datasets.set(ds.id, ds));
        }
    }

    /* 
     * Update [displayOrder].
     */
    ord = state.displayOrder.get(oldDs.id);
    if (ord) {
        state.displayOrder.set(newDs.id, ord!)
        state.displayOrder.delete(oldDs.id);
    }
    state.displayOrder.forEach((ord) => {
        if (ord.nextId === oldDs.id) { ord.nextId = newDs.id; }
        if (ord.prevId === oldDs.id) { ord.prevId = newDs.id; }
    });

    return Object.assign({}, state, {
        all: new Map(state.all),
        display: new Map(state.display),
        displayOrder: new Map(state.displayOrder)
    });
};

const setDatasets = (state: DatasetsState, action: DatasetAction): DatasetsState => {
    const all: Map<string,PatientListDatasetQuery> = new Map([[ demographics.id, demographics ]]);
    action.datasets!.forEach((ds) => all.set(ds.id, ds));

    return Object.assign({}, state, {
        all,
        display: new Map(action.result!.categories),
        displayOrder: new Map(action.result!.displayOrder)
    });
};

const setDatasetsSearchTermResult = (state: DatasetsState, action: DatasetAction): DatasetsState => {
    return Object.assign({}, state, {
        display: action.result!.categories,
        displayOrder: action.result!.displayOrder
    });
};

const setDatasetDisplay = (state: DatasetsState, action: DatasetAction): DatasetsState => {
    const ds = action.dataset!;
    state.display.get(ds.category)!.datasets.set(ds.id, ds);

    return Object.assign({}, state, {
        display: new Map(state.display)
    });
};

const setDatasetSelected = (state: DatasetsState, action: DatasetAction): DatasetsState => {
    return Object.assign({}, state, {
        selected: action.dataset!.id
    });
};

const setDataset = (state: DatasetsState, action: DatasetAction): DatasetsState => {
    const ds = action.dataset!;
    state.all.set(ds.id, ds);

    return Object.assign({}, state, {
        all: new Map(state.all)
    });
};

const removeDataset = (state: DatasetsState, action: DatasetAction): DatasetsState => {
    const ds = action.dataset!;
    state.all.delete(ds.id);
    state.display.get(ds.category)!.datasets.delete(ds.id);

    if (!state.display.has(ds.category)) {
        state.display.delete(ds.category);
    }

    return Object.assign({}, state, {
        all: new Map(state.all),
        display: new Map(state.display)
    });
};

const addDataset = (state: DatasetsState, action: DatasetAction): DatasetsState => {
    const ds = action.dataset!;
    let displayCat = state.display.get(ds.category);
    if (displayCat) {
        displayCat.datasets.set(ds.id, ds);
    } else {
        displayCat = { category: ds.category, datasets: new Map([[ ds.id, ds ]])};
        state.display.set(displayCat.category, displayCat);
    }

    return Object.assign({}, state, {
        display: new Map(state.display)
    });
};

const moveDatasetCategory = (state: DatasetsState, action: DatasetAction): DatasetsState => {
    const ds = action.dataset!;
    const category = action.category!; // new catgory

    const oldCategory = state.display.get(ds.category);
    if (oldCategory) { 
        oldCategory.datasets.delete(ds.id);
        if (!oldCategory.datasets.size) {
            state.display.delete(oldCategory.category);
        }
    }

    let newCategory = state.display.get(category);
    if (newCategory) {
        newCategory.datasets.set(ds.id, ds);
    } else {
        newCategory = { category, datasets: new Map([[ ds.id, ds ]])};
        state.display.set(newCategory.category, newCategory);
    }

    return Object.assign({}, state, {
        display: new Map(state.display)
    });
};

const setDatasetsSearchTerm = (state: DatasetsState, action: DatasetAction): DatasetsState => {
    return Object.assign({}, state, {
        searchTerm: action.searchTerm
    });
};

export const datasets = (state: DatasetsState = defaultDatasetsState(), action: DatasetAction): DatasetsState => {

    switch (action.type) {
        case SET_DATASETS:
            return setDatasets(state, action);
        case SET_DATASET:
            return setDataset(state, action);
        case SET_DATASET_SELECTED:
            return setDatasetSelected(state, action);
        case SET_DATASET_DISPLAY:
            return setDatasetDisplay(state, action);
        case SET_DATASETS_SEARCH_TERM:
            return setDatasetsSearchTerm(state, action);
        case SET_DATASETS_SEARCH_RESULT:
            return setDatasetsSearchTermResult(state, action);
        case REMOVE_DATASET:
            return removeDataset(state, action);
        case ADD_DATASET:
            return addDataset(state, action);
        case MOVE_DATASET_CATEGORY:
            return moveDatasetCategory(state, action);
        case SWITCH_DATASET_OLD_FOR_NEW:
            return switchDatasetOldForNew(state, action);

        default:
            return state;
    }
};