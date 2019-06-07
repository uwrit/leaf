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
    SET_DATASETS_DISPLAY_ALL,
    SET_DATASETS_SEARCH_TERM,
    SET_DATASETS_SEARCH_RESULT,
    REMOVE_DATASET,
    ADD_DATASET,
    MOVE_DATASET_CATEGORY,
    SET_DATASET_DISPLAY
} from "../actions/datasets";
import { PatientListDatasetQuery, CategorizedDatasetRef, IndexedPatientListDatasetQuery } from "../models/patientList/Dataset";

export const defaultDatasetsState = (): DatasetsState => {
    return {
        allMap: new Map(),
        allCategorized: [],
        display: [],
        displayCount: 0,
        searchTerm: ''
    };
};

const setDatasets = (state: DatasetsState, action: DatasetAction): DatasetsState => {
    const allMap: Map<string,PatientListDatasetQuery> = new Map();
    action.datasets!.forEach((ds) => allMap.set(ds.id, ds));

    return Object.assign({}, state, {
        allMap,
        allCategorized: action.categories!,
        display: action.categories!,
        displayCount: action.datasets!.length
    });
};

const setDatasetsDisplayAll = (state: DatasetsState, action: DatasetAction): DatasetsState => {
    return Object.assign({}, state, {
        display: state.allCategorized,
        displayCount: state.allMap.size
    });
};

const setDatasetsSearchTermResult = (state: DatasetsState, action: DatasetAction): DatasetsState => {
    return Object.assign({}, state, {
        display: action.result!.categories,
        displayCount: action.result!.datasetCount
    });
};

const setDatasetDisplay = (state: DatasetsState, action: DatasetAction): DatasetsState => {
    const categories = state.display.slice();
    const category = Object.assign({}, categories[action.datasetCategoryIndex!]);

    category.datasets[action.datasetIndex!] = action.dataset! as IndexedPatientListDatasetQuery;
    categories[action.datasetCategoryIndex!] = category;

    return Object.assign({}, state, {
        allMap: new Map(state.allMap),
        display: categories
    });
};

const setDataset = (state: DatasetsState, action: DatasetAction): DatasetsState => {
    state.allMap.set(action.dataset!.id, action.dataset!);

    return Object.assign({}, state, {
        allMap: new Map(state.allMap)
    });
};

const removeDataset = (state: DatasetsState, action: DatasetAction): DatasetsState => {
    let categoryIdx = -1;
    let dsIdx = -1;

    /*
     * Remove from 'all'
     */
    const allCategorized = state.allCategorized.slice();
    categoryIdx = allCategorized.findIndex((cat) => cat.category === action.dataset!.category);

    if (categoryIdx > -1) {
        const categoryAll = allCategorized[categoryIdx];
        dsIdx = categoryAll.datasets.findIndex((d) => d.id === action.dataset!.id);
        if (dsIdx > -1) {
            categoryAll.datasets.splice(dsIdx, 1);
            if (!categoryAll.datasets.length) {
                allCategorized.splice(categoryIdx, 1);
            }
        }
    }

    /*
     * Remove from 'display'
     */
    const display = state.display.slice();
    categoryIdx = display.findIndex((cat) => cat.category === action.dataset!.category);

    if (categoryIdx > -1) {
        const categoryDisplay = display[categoryIdx];
        dsIdx = categoryDisplay.datasets.findIndex((d) => d.id === action.dataset!.id);
        if (dsIdx > -1) {
            categoryDisplay.datasets.splice(dsIdx, 1);
            if (!categoryDisplay.datasets.length) {
                display.splice(categoryIdx, 1);
            }
        }
    }
    state.allMap.delete(action.dataset!.id);

    return Object.assign({}, state, {
        allMap: new Map(state.allMap),
        allCategorized,
        display,
        displayCount: state.displayCount - 1
    });
};

const addDataset = (state: DatasetsState, action: DatasetAction): DatasetsState => {
    state.allMap.set(action.dataset!.id, action.dataset!);

    /* 
     * Add to the 'all' array.
     */
    const allCategorized = state.allCategorized.slice();
    let emptyCategoryIdx = state.allCategorized.findIndex((cat) => !cat.category);

    if (emptyCategoryIdx > -1) {
        allCategorized[emptyCategoryIdx].datasets.unshift(action.dataset! as IndexedPatientListDatasetQuery);
    } else {
        allCategorized.unshift({ category: '', datasets: [ action.dataset! as IndexedPatientListDatasetQuery]});
    }

    /* 
     * Add to the 'display' array.
     */
    const display = state.display.slice();
    emptyCategoryIdx = state.display.findIndex((cat) => !cat.category);

    if (emptyCategoryIdx > -1) {
        display[emptyCategoryIdx].datasets.unshift(action.dataset! as IndexedPatientListDatasetQuery);
    } else {
        display.unshift({ category: '', datasets: [ action.dataset! as IndexedPatientListDatasetQuery ]});
    }

    return Object.assign({}, state, {
        allMap: new Map(state.allMap),
        allCategorized,
        display,
        displayCount: state.displayCount + 1
    });
};

const moveDatasetCategory = (state: DatasetsState, action: DatasetAction): DatasetsState => {
    const { dataset, category } = action;

    return Object.assign({}, state, {
        allCategorized: moveDatasetFromCategorizedArray(dataset!, category!, state.allCategorized),
        display: moveDatasetFromCategorizedArray(dataset!, category!, state.display)
    });
};

const moveDatasetFromCategorizedArray = (dataset: PatientListDatasetQuery, newCategory: string, categories: CategorizedDatasetRef[]): CategorizedDatasetRef[] => {
    const clone = Object.assign({}, dataset, { category: newCategory }) as IndexedPatientListDatasetQuery ;

    /* 
     * Remove from old category array.
     */
    let newCategories = categories.slice();
    const oldCatIdx = newCategories.findIndex((cat) => cat.category === dataset.category);
    if (oldCatIdx > -1) {
        const oldCat = newCategories[oldCatIdx];
        const oldDsIdx = oldCat.datasets.findIndex((ds) => ds.id === dataset.id)!;
        oldCat.datasets.splice(oldDsIdx, 1);
        if (!oldCat.datasets.length) {
            newCategories.splice(oldCatIdx, 1);
        }
    }
    /*
     * Add into new category array.
     */
    const newCatIdx = newCategories.findIndex((cat) => cat.category === newCategory);
    if (newCatIdx > -1) {
        const newCat = newCategories[newCatIdx];
        newCat.datasets.unshift(clone);
    } else {
        const newCat: CategorizedDatasetRef = { category: newCategory, datasets: [ clone ] };
        newCategories.push(newCat);
        newCategories = newCategories.sort((a,b) => a.category > b.category ? 1 : -1);
    }
    return newCategories;
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
        case SET_DATASET_DISPLAY:
            return setDatasetDisplay(state, action);
        case SET_DATASETS_DISPLAY_ALL:
            return setDatasetsDisplayAll(state, action);
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