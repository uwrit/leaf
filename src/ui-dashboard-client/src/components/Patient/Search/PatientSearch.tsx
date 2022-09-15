import React from 'react';
import { Input, InputGroup } from 'reactstrap';
import { DemographicRow } from '../../../models/cohortData/DemographicDTO';
import { keys } from '../../../models/Keyboard';
import { useParams, useNavigate, NavigateFunction } from "react-router-dom";
import HintContainer from './HintContainer';
import { searchForPatients, setSearchTerm } from '../../../actions/cohort';
import './PatientSearch.css';

interface Props {
    cohortId?: string;
    dispatch?: any;
    hints: DemographicRow[];
    nav?: NavigateFunction;
    term: string
}

interface State {
    selectedHintIndex: number,
    showHintsDropdown: boolean,
}

class PatientSearch extends React.PureComponent<Props, State> {
    private className = 'patient-search';
    private hintLimit = 5;

    constructor(props: Props) {
        super(props);
        this.state = {
            selectedHintIndex: -1,
            showHintsDropdown: false
        }
    }

    public componentDidUpdate() { return; }

    public render() {
        const { cohortId, hints, term } = this.props;
        const { selectedHintIndex, showHintsDropdown } = this.state;
        const c = this.className;
        
        return (
            <div className={`${c}-container`}>
                <InputGroup>
                    
                    {/* Search box container */}
                    <div className={`${c}-input-container`}>

                        {/* Search input */}
                        <Input 
                            className={`${c}-input leaf-input`} 
                            onBlur={this.handleInputBlur}
                            onChange={this.handleSearchInputChange}
                            onFocus={this.handleInputFocus}
                            onKeyDown={this.handleSearchKeydown}
                            placeholder="Search patients..." 
                            spellCheck={false}
                            value={term} />

                        {/* Search suggestions pseudo-dropdown */}
                        {showHintsDropdown && 
                        <HintContainer
                            cohortId={cohortId!}
                            hints={hints}
                            selectedHintIndex={selectedHintIndex}
                        />
                        }
                    </div>
                </InputGroup>
            </div>
        )
    }

    private handleInputFocus = async () => {
        const { dispatch, term } = this.props;
        dispatch(searchForPatients(term, this.hintLimit));
        this.setState({ showHintsDropdown: true });
    };

    private handleInputBlur = () => {
        setTimeout(() => this.setState({ showHintsDropdown: false }), 200);
    };

    private handleArrowUpDownKeyPress = (key: number) => {
        const { hints } = this.props;
        const { showHintsDropdown, selectedHintIndex } = this.state;
        if (!showHintsDropdown) { return selectedHintIndex; }

        const currentFocus = this.state.selectedHintIndex;
        const hintCount = hints.length;
        const minFocus = 0;
        const maxFocus = hintCount - 1;
        const newFocus = key === keys.ArrowUp
            ? currentFocus === minFocus ? maxFocus : currentFocus - 1
            : currentFocus === maxFocus ? minFocus : currentFocus + 1;

        return newFocus;
    }

    private handleEnterKeyPress = () => {
        const { cohortId, nav, hints, dispatch } = this.props;
        const { selectedHintIndex } = this.state;
        const selected = hints[selectedHintIndex];

        if (selected && nav) {
            const patientId = selected.personId;
            dispatch(setSearchTerm(''));
            nav(`/dashboard/cohort/${cohortId}/patients/${patientId}`);
        }
    }

    private handleSearchKeydown = (k: React.KeyboardEvent<HTMLInputElement>) => {
        const { term } = this.props;
        const { selectedHintIndex } = this.state;
        const key = (k.key === ' ' ? keys.Space : keys[k.key as any]);

        if (!key) { return; }
        let newFocus = selectedHintIndex;

        switch (key) {
            case keys.ArrowUp: 
            case keys.ArrowDown:
                newFocus = this.handleArrowUpDownKeyPress(key);
                k.preventDefault();
                break;
            case keys.Backspace:
                newFocus = -1;
                break;
            case keys.Enter:
                this.handleEnterKeyPress();
                break;
            case keys.Space:
                this.handleSearchInput(term);
                break;
            case keys.Escape:
                this.handleSearchTextClear();
                break;
        }
        if (newFocus !== selectedHintIndex) {
            this.setState({ selectedHintIndex: newFocus });
        }
    }

    private handleSearchTextClear = () => {
        const { dispatch } = this.props;
        dispatch(searchForPatients('', this.hintLimit));
    }

    private handleSearchInputChange = async (e: React.FormEvent<HTMLInputElement>) => {
        this.handleSearchInput(e.currentTarget.value);
    }

    private handleSearchInput = (term: string) => {
        const { dispatch } = this.props;
        dispatch(searchForPatients(term, this.hintLimit));
        this.setState({ selectedHintIndex: 0 });
    }
}

const withRouter = (PatientSearch: any) => (props: Props) => {
    const params = useParams();
    const nav = useNavigate();
    const { cohortId } = params;
    return <PatientSearch cohortId={cohortId} nav={nav} dispatch={props.dispatch} hints={props.hints} term={props.term} />;
};

export default withRouter(PatientSearch);