/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { GoCloudDownload } from 'react-icons/go';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
import { Action, Dispatch } from 'redux';
import { setPatientListPagination } from '../../actions/cohort/patientList';
import { toggleExportDataModal } from '../../actions/generalUi';
import LoaderIcon from '../../components/Other/LoaderIcon/LoaderIcon';
import AddDatasetButton from '../../components/PatientList/AddDatasetButton/AddDatasetButton';
import DatasetColumnSelector from '../../components/PatientList/DatasetColumnSelector';
import ExportDataModal from '../../components/PatientList/ExportDataModal/ExportDataModal';
import Paginate from '../../components/PatientList/Paginate';
import PatientListTable from '../../components/PatientList/PatientListTable';
import { AppState, AuthorizationState, DatasetsState } from '../../models/state/AppState';
import { CohortStateType, NetworkCohortState, PatientListState, CohortState } from '../../models/state/CohortState';
import ExportState from '../../models/state/Export';
import { NetworkResponderMap } from '../../models/NetworkResponder';
import CohortTooLargeBox from '../../components/Other/CohortTooLargeBox/CohortTooLargeBox';
import { RowCount } from '../../components/PatientList/RowCount';
import { PatientListDatasetDefinition } from '../../models/patientList/Dataset';
import './PatientList.css';

interface OwnProps {
    
}
interface StateProps {
    auth: AuthorizationState;
    exportState: ExportState;
    cohort: CohortState;
    datasets: DatasetsState;
    isIdentified: boolean;
    patientList: PatientListState;
    responders: NetworkResponderMap;
    showExportModal: boolean;
    totalPatients: number;
}
interface DispatchProps {
    dispatch: (f: any) => void;
}
type Props = StateProps & OwnProps & DispatchProps;

interface State {
    showCountDetails: boolean;
}

class PatientList extends React.PureComponent<Props, State> {
    private className = 'patientlist';
    constructor(props: Props) {
        super(props);
        this.state = {
            showCountDetails: false
        }
    }

    public render() {
        const { auth, exportState, cohort, datasets, isIdentified, patientList, responders, dispatch, showExportModal } = this.props;
        const c = this.className;
        const classes = [ `${c}-container`, 'scrollable-offset-by-header' ];
        const datasetDefs: PatientListDatasetDefinition[] = [ ...patientList.configuration.singletonDatasets.values() ];
        
        /*
         * Calculate the number of patients and rows displayed.
         */
        let totalResponders = 0;
        cohort.networkCohorts.forEach((nc: NetworkCohortState) => {
            if (nc.count.state === CohortStateType.LOADED) {
                totalResponders++;
            }
        });
        const showPaginate = patientList.totalPatients > patientList.configuration.pageSize;

        /*
         * If too many patients for caching, let user know.
         */
        if (cohort.networkCohorts.size === 1 && cohort.count.value > auth.config!.cacheLimit) {
            return <CohortTooLargeBox cacheLimit={auth.config!.cacheLimit} />
        }
        /*
         * Show a loading spinner if no responders have completed yet.
         */
        if (cohort.patientList.state === CohortStateType.REQUESTING) {
            return (
                <div className={`${c}-loading`}>
                    <LoaderIcon size={100} />
                </div>
            );
        /*
         * Show the failure .
         */
        } else if (cohort.patientList.state === CohortStateType.IN_ERROR) {
            return (
                <div className={`${c}-error`}>
                    <p>
                        Whoops! An error occurred while loading the patient list.
                        We are sorry for the inconvenience. Please contact your Leaf administrator if this error continues.
                    </p>
                </div>
            );
       }

        return (    
            <div className={classes.join(' ')}>
                <ExportDataModal 
                    dispatch={dispatch} 
                    exportState={exportState} 
                    rowCount={patientList.totalPatients + patientList.totalRows}
                    show={showExportModal} 
                    toggle={toggleExportDataModal}
                />
                <Row className={`${c}-toprow-container`}>
                    <Col md={8}>
                        <div className={`${c}-dataset-column-selector-container`}>
                            <div className={`${c}-dataset-text-info`}>Current Datasets (click to edit columns)</div>
                            {datasetDefs.map((d: PatientListDatasetDefinition) => (
                                <DatasetColumnSelector className={c} data={d} dispatch={dispatch} key={d.id} />
                            ))}
                            {patientList.totalPatients > 0 && datasetDefs.length <= datasets.display.size &&
                            <AddDatasetButton 
                                cohortMap={cohort.networkCohorts}
                                configuration={patientList.configuration} 
                                datasets={datasets}
                                dispatch={dispatch} 
                                responderMap={responders}
                            />
                            }
                        </div>
                        <RowCount 
                            exportLimit={auth.config!.exportLimit}
                            isIdentified={isIdentified}
                            isFederated={totalResponders > 1}
                            totalCohortPatients={cohort.count.value} 
                            totalPatients={patientList.totalPatients} 
                            totalDatapoints={patientList.totalRows} 
                        />
                    </Col>
                    <Col md={4}>
                        <div className={`${c}-export-button-container`}>
                            <div className="leaf-button-main" onClick={this.handleExportClick}>
                                <span><GoCloudDownload className={`${c}-export-button`}/>Export Data</span>
                            </div>
                        </div>
                    </Col>
                </Row>
                {showPaginate &&
                <Paginate 
                    dispatch={dispatch}
                    handlePageCountClick={this.handlePageCountClick}
                    patientList={patientList}
                    totalPatients={patientList.totalPatients}
                />
                }
                <PatientListTable
                    className={c}
                    dispatch={dispatch}
                    responders={responders}
                    patientList={patientList}
                />
                {showPaginate && patientList.totalPatients > 25 &&
                <Paginate 
                    dispatch={dispatch}
                    handlePageCountClick={this.handlePageCountClick}
                    patientList={patientList}
                    totalPatients={patientList.totalPatients}
                />
                }
            </div>
        )
    }

    private handlePageCountClick = (data: any) => {
        const { dispatch, patientList } = this.props;
        const page = data.selected;
        if (page !== patientList.configuration.pageNumber) {
            dispatch(setPatientListPagination(page));
        }
    }

    private handleExportClick = () => {
        const { dispatch } = this.props;
        dispatch(toggleExportDataModal());
    }
}

const mapStateToProps = (state: AppState, ownProps: OwnProps): StateProps => {
    return { 
        auth: state.auth,
        datasets: state.datasets,
        exportState: state.dataExport,
        cohort: state.cohort,
        isIdentified: state.session.attestation!.isIdentified,
        patientList: state.cohort.patientList,
        responders: state.responders,
        showExportModal: state.generalUi.showExportDataModal,
        totalPatients: state.cohort.count.value
    };
};

const mapDispatchToProps = (dispatch: Dispatch<Action<any>>, ownProps: OwnProps) : DispatchProps => {
    return { dispatch };
}

export default connect<StateProps, DispatchProps, OwnProps, AppState>
    (mapStateToProps, mapDispatchToProps)(PatientList)