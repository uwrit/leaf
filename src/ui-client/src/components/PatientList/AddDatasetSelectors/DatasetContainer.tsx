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
    datasets: DatasetsState;
    dispatch: any;
    handleDatasetSelect: (id: string) => void;
    handleDatasetRequest: () => any;
    searchEnabled: boolean;
    selected: string;
}

interface State {
    categoryIndex: number;
    datasetIndex: number;
}

export default class DatasetContainer extends React.PureComponent<Props,State> {
    private className = 'patientlist-add-dataset';
    constructor(props: Props) {
        super(props);
        this.state = {
            categoryIndex: 0,
            datasetIndex: 0
        }
    }

    public static defaultProps = {
        autoSelectOnSearch: true,
        searchEnabled: true
    }

    public recalculateDatasetIndex = () => {
        const { datasets, selected } = this.props;
        const catName = datasets.allMap.get(selected)!.category;
        const catIdx = datasets.display.findIndex((c) => catName === c.category);

        if (catIdx > -1) {
            const dsIdx = datasets.display[catIdx].datasets.findIndex((d) => d.id === selected);
            if (dsIdx > -1) {
                this.setState({ categoryIndex: catIdx, datasetIndex: dsIdx });
            }
        }
        
    }

    public getSnapshotBeforeUpdate(prevProps: Props) {
        const { datasets, handleDatasetSelect, autoSelectOnSearch } = this.props;

        if (datasets.displayCount && datasets.displayCount !== prevProps.datasets.displayCount) {
            if (autoSelectOnSearch) {
                handleDatasetSelect(datasets.display[0].datasets[0].id);
            } else {
                handleDatasetSelect('');
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
                            {cat.datasets.map((d: PatientListDatasetQuery) => {
                                return (
                                    <div 
                                        key={d.id} 
                                        className={this.setDatasetOptionClass(d)} 
                                        onClick={this.handleDatasetOptionClick.bind(null, d)}
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

        const newIdx = this.calculateNewDatasetAfterKeypress(key);
        handleDatasetSelect(newIdx);
    }

    private calculateNewDatasetAfterKeypress = (key: number): string => {
        const { datasets, selected } = this.props;
        const { categoryIndex, datasetIndex } = this.state;
        const relevant = new Set([ keys.ArrowDown, keys.ArrowUp ]);
        const currCat = datasets.display[categoryIndex];

        if (!relevant.has(key)) { return selected; }
        if (!currCat) { return ''; }
        const currDataset = currCat.datasets[datasetIndex];

        if (datasets.displayCount && currDataset) {
            if (key === keys.ArrowUp) {
                return currDataset.prevId;
            } else {
                return currDataset.nextId;
            }
        } else {
            return selected;
        }
    }

    /*
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
    */

    private handleDatasetOptionClick = (dataset: PatientListDatasetQuery) => {
        const { handleDatasetSelect } = this.props;
        handleDatasetSelect(dataset.id);
    }

    private setDatasetOptionClass = (dataset: PatientListDatasetQuery) => {
        const { selected } = this.props;
        const c = this.className;
        const classes = [ `${c}-select-dataset-option` ];

        if (dataset.id === selected) { classes.push('selected'); }
        if (dataset.unsaved) { classes.push('unsaved'); }

        return classes.join(' ');
    }
};