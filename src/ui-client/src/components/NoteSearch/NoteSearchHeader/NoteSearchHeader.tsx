import React from 'react';
import { CohortState } from '../../../models/state/CohortState';
import { getNotesDataset, removeNoteDataset } from '../../../actions/cohort/noteSearch';
import { SearchTermEditor } from '../SearchTermEditor/SearchTermEditor';
import { DatasetsState } from '../../../models/state/AppState';
import AddDatasetButton from '../../PatientList/AddDatasetButton/AddDatasetButton';
import { NetworkResponderMap } from '../../../models/NetworkResponder';
import './NoteSearchHeader.css';
import { PatientListDatasetQuery } from '../../../models/patientList/Dataset';

interface Props {
    cohort: CohortState;
    datasets: DatasetsState;
    dispatch: any;
    responders: NetworkResponderMap;
}

interface State {
    DOMRect?: DOMRect;
    dateFilterOpen: boolean;
    noteSelectorOpen: boolean;
    showCustomDateRangeBox: boolean;
}

export class NoteSearchHeader extends React.PureComponent<Props, State> {
    private className = 'note-search-header';

    public constructor(props: Props) {
        super(props);
        this.state = {
            dateFilterOpen: false,
            noteSelectorOpen: false,
            showCustomDateRangeBox: false
        }
    }
     
    public render() {
        const { cohort, datasets, dispatch, responders } = this.props;
        const c = this.className;

        return (
            <div className={c}>

                {/* Left side */}
                <div className='left'>
                    <div className='patientlist-dataset-column-selector-container'>
                        <div className={`${c}-dataset-text-info`}>Current Clinical Note Types:</div>
                        <AddDatasetButton
                            cohortMap={cohort.networkCohorts}
                            configuration={cohort.noteSearch.configuration} 
                            datasets={datasets}
                            dispatch={dispatch}
                            handleDatasetRequest={getNotesDataset} 
                            responderMap={responders}
                        />
                    </div>
                    <div>
                        {[ ...cohort.noteSearch.configuration.datasets.values() ].map((d) => {
                            return (
                                <span className={`${c}-note-dataset`} key={d.id} onClick={this.handleDatasetClick.bind(null, d)}>
                                    {d.name}
                                    <span className={`${c}-note-dataset-remove`}>✕</span>
                                </span>
                            );
                        })}
                    </div>
                </div>

                {/* Right side */}
                <div className='right'>
                    <SearchTermEditor dispatch={dispatch} terms={cohort.noteSearch.terms}/>
                </div>

            </div>
        );
    }

    private handleDatasetClick = (dataset: PatientListDatasetQuery) => {
        const { dispatch } = this.props;
        dispatch(removeNoteDataset(dataset));
    }
}