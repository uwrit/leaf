/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { CategorizedDatasetRef, PatientListDatasetQuery, IndexedPatientListDatasetQuery } from '../../../models/patientList/Dataset';
import { keys } from '../../../models/Keyboard';
import { Input } from 'reactstrap';
import { DatasetsState } from '../../../models/state/AppState';
import { searchPatientListDatasets, setDatasetSearchTerm } from '../../../actions/datasets';

interface Props {
    autoSelectOnSearch: boolean;
    datasets: DatasetsState;
    dispatch: any;
    handleDatasetSelect: (dataset: IndexedPatientListDatasetQuery | undefined) => void;
    handleDatasetRequest: () => any;
    searchEnabled: boolean;
    selected?: IndexedPatientListDatasetQuery;
}

export default class DatasetContainer extends React.PureComponent<Props> {
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

    public getSnapshotBeforeUpdate(prevProps: Props) {
        const { datasets, handleDatasetSelect, autoSelectOnSearch } = this.props;

        if (autoSelectOnSearch && datasets.displayCount && datasets.displayCount !== prevProps.datasets.displayCount) {
            const firstCat = [ ...datasets.display.values() ][0];
            const firstDs = [ ...firstCat.datasets.values() ][0];
            handleDatasetSelect(firstDs);
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

                {/* Search */}
                <Input
                    className={`${c}-input leaf-input`} 
                    disabled={!searchEnabled}
                    onChange={this.handleSearchInputChange}
                    onKeyDown={this.handleSearchKeydown}
                    placeholder="Search..." 
                    spellCheck={false}
                    value={datasets.searchTerm} />
                <div className={`${c}-select-datasets-list`}>

                    {/* No datasets found */}
                    {datasets.display.size === 0 &&
                    <div className={`${c}-select-nodatasets`}>
                        No datasets found. Try refining your search.
                    </div>
                    }

                    {/* Categories */}
                    {[ ...datasets.display.values() ].map((cat: CategorizedDatasetRef) => {
                        return (
                        <div className={`${c}-select-category`} key={cat.category}>
                            <div className={`${c}-select-category-name`}>{cat.category}</div>

                            {/* Datasets */}
                            {[ ...cat.datasets.values() ].map((d: IndexedPatientListDatasetQuery) => {
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
        if (!key || !datasets.displayCount) { return; }

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
        const { datasets, selected } = this.props;

        if (datasets.displayCount && selected) {
            if (key === keys.ArrowUp) {
                return handleDatasetSelect(selected.prev);
            } else {
                return handleDatasetSelect(selected.next);
            }
        }
    }

    private handleDatasetOptionClick = (dataset: IndexedPatientListDatasetQuery) => {
        const { handleDatasetSelect } = this.props;
        handleDatasetSelect(dataset);
    }

    private setDatasetOptionClass = (dataset: IndexedPatientListDatasetQuery) => {
        const { selected } = this.props;
        const c = this.className;
        const classes = [ `${c}-select-dataset-option` ];

        if (selected && dataset.id === selected.id) { classes.push('selected'); }
        if (dataset.unsaved) { classes.push('unsaved'); }

        return classes.join(' ');
    }
};