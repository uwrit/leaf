/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Col, Row } from 'reactstrap';
import { toggleDatasetColumn, deleteDataset } from '../../actions/cohort/patientList';
import CheckBoxSlider from '../Other/CheckboxSlider/CheckboxSlider';
import PopupBox from '../Other/PopupBox/PopupBox';
import { PatientListDatasetDefinition, PatientListDatasetSummaryType } from '../../models/patientList/Dataset';
import { PatientListColumn } from '../../models/patientList/Column';

interface Props {
    allowRemove: boolean;
    className?: string;
    data: PatientListDatasetDefinition;
    dispatch: any;
}

interface State {
    DOMRect?: DOMRect;
    showColumnBox: boolean;
}

export default class DatasetColumnSelector extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            showColumnBox: false
        }
    }

    public render() {
        const { className, data, allowRemove } = this.props;
        const c = className ? className : 'patientlist';
        const cs = `${c}-column-selector`;
        const isDemographics = data.id === 'demographics';
        const cols: PatientListColumn[] = [];
        data.columns.forEach((col: PatientListColumn) => cols.push(col));

        return (
            <div className={`${c}-dataset`} onClick={this.handleClick}>
                {data.displayName}
                {this.state.showColumnBox &&
                    <PopupBox 
                        parentDomRect={this.state.DOMRect!} 
                        toggle={this.handleColumnBoxClickedOutside}>
                        <div className={`${cs}-container`}>
                            {!isDemographics &&
                            <div className={`${cs}-remove ${!allowRemove ? 'not-allowed' : ''}`}>
                                <span onClick={this.handleRemoveDatasetClick}>Remove</span>
                            </div>
                            }
                            {!data.summaryType && !isDemographics &&
                            <div className={`${cs}-datefilter`}>
                                <span className={`${cs}-datefilter-value`}>{data.displayName}</span>
                            </div>
                            }
                            {typeof data.encounterPanelIndex !== 'undefined' &&
                            <div className={`${cs}-datefilter`}>
                                <span className={`${cs}-datefilter-value`}>{data.displayName} - Encounters in Panel {data.encounterPanelIndex+1}</span>
                            </div>
                            }
                            {data.dateBounds &&
                            <div className={`${cs}-datefilter`}>
                                <span className={`${cs}-datefilter-value`}>{data.displayName} - {data.dateBounds!.display}</span>
                            </div>
                            }
                            {!!data.summaryType &&
                            <div className={`${cs}-text`}>
                                <span>{this.getSummaryText(data.summaryType!)}</span>
                            </div>
                            }
                            {cols.map((col: PatientListColumn) => (
                                <Row className={cs} key={col.id}>
                                    <Col md={8}>
                                        <div className={`${c}-name`}>{col.displayName}</div>
                                    </Col>
                                    <Col md={4}>
                                        <CheckBoxSlider checked={col.isDisplayed} onClick={this.handleColumnClick.bind(null, col)} />
                                    </Col>
                                </Row>
                            ))}
                        </div>
                    </PopupBox>
                }
            </div>
        );
    }

    private handleClick = (e: any) => { 
        if (e.target.className === e.currentTarget.className || !this.state.showColumnBox) {
            const domRect: DOMRect = e.target.getBoundingClientRect();
            this.setState({ showColumnBox: !this.state.showColumnBox, DOMRect: domRect });
        }
    }

    private handleRemoveDatasetClick = () => {
        const { data, allowRemove, dispatch } = this.props;
        if (!allowRemove) { return; }

        this.setState({ showColumnBox: false });
        dispatch(deleteDataset(data));
    }

    private handleColumnBoxClickedOutside = () => {
        this.setState({ showColumnBox: !this.state.showColumnBox });
    }

    private handleColumnClick = (col: PatientListColumn) => {
        const { dispatch } = this.props;
        dispatch(toggleDatasetColumn(col));
    }

    private getSummaryText = (type: PatientListDatasetSummaryType) => {
        const c = `patientlist-column-selector-emphasis`;
        if (type === PatientListDatasetSummaryType.Quantitative) {
            return (
                <p>This is a <span className={c}>numeric</span> dataset, and the columns here represent statistical summaries. 
                    To drill down to actual raw data values, click on a patient in the patient list.
                </p>
            );
        }
        else {
            return (
                <p>This is a <span className={c}>non-numeric</span> dataset, and the columns here show a count of the total rows of data and
                    the earliest and most recent values. To drill down to actual raw data values, click on a patient in the patient list.
                </p>
            );
        }
    }
}