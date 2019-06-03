/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { CategorizedDatasetRef, PatientListDatasetQuery } from '../../../models/patientList/Dataset';
import { keys } from '../../../models/Keyboard';
import { Input } from 'reactstrap';
import { DatasetsState } from '../../../models/state/AppState';
import { searchPatientListDatasets, setDatasetSearchTerm } from '../../../actions/datasets';

interface Props {
    autoSelectOnSearch: boolean;
    categoryIdx: number;
    datasetIdx: number;
    datasets: DatasetsState;
    dispatch: any;
    handleDatasetSelect: (categoryIdx: number, datasetIdx: number) => void;
    handleDatasetRequest: () => any;
    searchEnabled: boolean;
}

export default class DatasetContainer extends React.PureComponent<Props> {
    private className = 'patientlist-add-dataset';
    constructor(props: Props) {
        super(props);
    }

    public static defaultProps = {
        autoSelectOnSearch: true,
        searchEnabled: true
    }

    public getSnapshotBeforeUpdate(prevProps: Props) {
        const { datasets, handleDatasetSelect, autoSelectOnSearch } = this.props;

        if (datasets.displayCount && datasets.displayCount !== prevProps.datasets.displayCount) {
            if (autoSelectOnSearch) {
                handleDatasetSelect(0, 0);
            } else {
                handleDatasetSelect(0, -1);
            }
        }
        return null;
    }

    public componentDidUpdate() { }

    public handleSearchInputChange = (e: React.FormEvent<HTMLInputElement>) => {
        const { dispatch } = this.props;
        const term = e.currentTarget.value;
        dispatch(searchPatientListDatasets(term));
        dispatch(setDatasetSearchTerm(term));
    }

    public render() {
        const { datasets, handleDatasetRequest, searchEnabled } = this.props;
        const c = this.className;
        return (
            <div>
                <Input
                    className={`${c}-input leaf-input`} 
                    disabled={!searchEnabled}
                    onChange={this.handleSearchInputChange}
                    onKeyDown={this.handleSearchKeydown}
                    placeholder="Search..." 
                    spellCheck={false}
                    value={datasets.searchTerm} />
                <div className={`${c}-select-datasets-list`}>
                    {datasets.display.length === 0 &&
                    <div className={`${c}-select-nodatasets`}>
                        No datasets found. Try refining your search.
                    </div>
                    }
                    {datasets.display.map((cat: CategorizedDatasetRef, catIdx: number) => {
                        return (
                        <div className={`${c}-select-category`} key={cat.category}>
                            <div className={`${c}-select-category-name`}>{cat.category}</div>
                            {cat.datasets.map((d: PatientListDatasetQuery, dsIdx: number) => {
                                return (
                                    <div 
                                        key={d.id} 
                                        className={this.setDatasetOptionClass(d, catIdx, dsIdx)} 
                                        onClick={this.handleDatasetOptionClick.bind(null, catIdx, dsIdx)}
                                        onDoubleClick={handleDatasetRequest}
                                        onKeyDown={this.handleSearchKeydown}
                                        tabIndex={0}>
                                        {d.name}
                                    </div>
                                );
                            })}
                        </div>)
                    })}
                </div>
            </div>
        )
    }

    private handleSearchKeydown = (k: React.KeyboardEvent<HTMLInputElement>) => {
        const { datasets, handleDatasetRequest } = this.props;
        const key = (k.key === ' ' ? keys.Space : keys[k.key as any]);
        if (!key || !datasets.display.length) { return; }

        switch (key) {
            case keys.ArrowUp: 
            case keys.ArrowDown:
                this.handleArrowUpDownKeyPress(key);
                k.preventDefault();
                break;
            case keys.Enter:
                handleDatasetRequest();
                break;
        }
    }

    private handleArrowUpDownKeyPress = (key: number) => {
        const { handleDatasetSelect } = this.props;

        const newIdxs = this.calculateNewDatasetAfterKeypress(key);
        handleDatasetSelect(newIdxs[0], newIdxs[1]);
    }

    private calculateNewDatasetAfterKeypress = (key: number): [ number, number ] => {
        const { datasets, categoryIdx, datasetIdx } = this.props;

        const totalCategories = datasets.display.length;
        const minDs = 0;
        const minCat = 0;
        const maxCat = totalCategories - 1;

        let newCatIdx = categoryIdx;
        let newDsIdx = datasetIdx;

        if (totalCategories > 1) {
            if (key === keys.ArrowUp) {
                if (categoryIdx === minCat) {
                    newCatIdx = datasetIdx === minDs ? maxCat : categoryIdx;
                } else {
                    newCatIdx = datasetIdx === minDs ? categoryIdx - 1 : categoryIdx;
                }
            } else if (key === keys.ArrowDown) {
                const maxDs = datasets.display[categoryIdx].datasets.length - 1;
                if (categoryIdx === maxCat) {
                    newCatIdx = datasetIdx === maxDs ? minCat : categoryIdx
                } else {
                    newCatIdx = datasetIdx === maxDs ? categoryIdx + 1 : categoryIdx;
                }
            }
        }

        const cat = datasets.display[newCatIdx];
        if (!cat) { return [categoryIdx, datasetIdx]; }

        const totalDatasets = cat.datasets.length;
        const maxDs = totalDatasets - 1;

        if (totalDatasets > 1) {
            if (newCatIdx === categoryIdx + 1) {
                newDsIdx = 0;
            } else if (newCatIdx > categoryIdx) {
                newDsIdx = maxDs;
            } else if (newCatIdx === categoryIdx - 1) {
                newDsIdx = maxDs;
            } else if (newCatIdx < categoryIdx) {
                newDsIdx = 0;
            } else {
                newDsIdx = key === keys.ArrowUp
                    ? datasetIdx === minDs ? maxDs : datasetIdx - 1
                    : datasetIdx === maxDs ? minDs : datasetIdx + 1;
            }
        } else {
            newDsIdx = 0;
        }
        return [ newCatIdx, newDsIdx ]; 
    }

    private handleDatasetOptionClick = (categoryIdx: number, datasetIdx: number) => {
        const { handleDatasetSelect } = this.props;
        handleDatasetSelect(categoryIdx, datasetIdx);
    }

    private setDatasetOptionClass = (dataset: PatientListDatasetQuery, catIdx: number, dsIdx: number) => {
        const { categoryIdx, datasetIdx } = this.props;
        const c = this.className;
        const classes = [ `${c}-select-dataset-option` ];

        if (catIdx === categoryIdx && dsIdx === datasetIdx) { classes.push('selected'); }
        if (dataset.unsaved) { classes.push('unsaved'); }

        return classes.join(' ');
    }
};