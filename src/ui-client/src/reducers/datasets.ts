/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
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
    SET_DATASETS_DISPLAY_ALL,
    SET_DATASET_SELECTED
} from "../actions/datasets";
import { PatientListDatasetQuery } from "../models/patientList/Dataset";

export const defaultDatasetsState = (): DatasetsState => {
    return {
        all: new Map(),
        allCategorized: new Map(),
        allOrder: new Map(),
        display: new Map(),
        displayOrder: new Map(),
        searchTerm: '',
        selected: ''
    };
};

const setDatasets = (state: DatasetsState, action: DatasetAction): DatasetsState => {
    const all: Map<string,PatientListDatasetQuery> = new Map();
    action.datasets!.forEach((ds) => all.set(ds.id, ds));

    return Object.assign({}, state, {
        all,
        allCategorized: new Map(action.result!.categories),
        allOrder: new Map(action.result!.displayOrder),
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

const setDatasetDisplayAll = (state: DatasetsState, action: DatasetAction): DatasetsState => {
    return Object.assign({}, state, {
        display: state.allCategorized,
        displayOrder: state.allOrder
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

    let allCat = state.allCategorized.get(ds.category);
    if (allCat) {
        allCat.datasets.set(ds.id, ds);
    } else {
        allCat = { category: ds.category, datasets: new Map([[ ds.id, ds ]])};
        state.allCategorized.set(allCat.category, allCat);
    }

    return Object.assign({}, state, {
        all: new Map(state.all)
    });
};

const removeDataset = (state: DatasetsState, action: DatasetAction): DatasetsState => {
    const ds = action.dataset!;
    state.all.delete(ds.id);
    state.allCategorized.get(ds.category)!.datasets.delete(ds.id);
    state.display.get(ds.category)!.datasets.delete(ds.id);

    if (!state.allCategorized.has(ds.category)) {
        state.allCategorized.delete(ds.category);
    }
    if (!state.display.has(ds.category)) {
        state.display.delete(ds.category);
    }

    return Object.assign({}, state, {
        all: new Map(state.all),
        allCategorized: new Map(state.allCategorized),
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
        case SET_DATASETS_DISPLAY_ALL:
            return setDatasetDisplayAll(state, action);
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

        default:
            return state;
    }
};