import React from 'react';
import { DropdownItem, DropdownMenu, DropdownToggle, Input, InputGroup, InputGroupButtonDropdown } from 'reactstrap';
import { DemographicRow } from '../../../models/cohortData/DemographicDTO';
import { keys } from '../../../models/Keyboard';
import { searchPatients } from '../../../services/patientSearchApi';
import { useNavigate, useParams } from "react-router-dom";
import HintContainer from './HintContainer';
import './PatientSearch.css';

interface Props {
    cohortId?: string;
}

interface State {
    hints: DemographicRow[];
    selectedHintIndex: number,
    showHintsDropdown: boolean,
    term: string
}

class PatientSearch extends React.PureComponent<Props, State> {
    private className = 'patient-search';
    constructor(props: Props) {
        super(props);
        this.state = {
            hints: [],
            selectedHintIndex: -1,
            showHintsDropdown: false,
            term: ''
        }
    }

    public componentDidUpdate() { return; }

    public render() {
        const { cohortId } = this.props;
        const { selectedHintIndex, term, hints, showHintsDropdown } = this.state;
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

    private handleInputFocus = () => this.setState({ showHintsDropdown: true });

    private handleInputBlur = () => {
        setTimeout(() => this.setState({ showHintsDropdown: false }), 500);
    };

    private handleArrowUpDownKeyPress = (key: number, hints: DemographicRow[]) => {
        const { showHintsDropdown, selectedHintIndex } = this.state;
        if (!showHintsDropdown) { return selectedHintIndex; }

        const currentFocus = this.state.selectedHintIndex;
        const hintCount = hints.length;
        const minFocus = 0;
        const maxFocus = hintCount - 1;
        const newFocus = key === keys.ArrowUp
            ? currentFocus === minFocus ? maxFocus : currentFocus - 1
            : currentFocus === maxFocus ? minFocus : currentFocus + 1;
            
        /*
        if (hints[newFocus]) {
            this.setState({ term: hints[newFocus]) };
        }
        */
        return newFocus;
    }

    private handleEnterKeyPress = () => {
        const { cohortId } = this.props;
        const { selectedHintIndex, hints } = this.state;

        if (selectedHintIndex > -1) {
            const patientId = hints[selectedHintIndex].personId;
            useNavigate()(`/${cohortId}/patients/${patientId}`);
        }

        /*
        if (term && term !== this.previousTerm) {
            this.previousTerm = term;
            const hint = conceptsSearchState.currentHints[selectedHintIndex];
            this.setState({ selectedHintIndex: -1, showHintsDropdown: false });

            // If a hint is currently focused, find its tree
            if (hint) {
                dispatch(fetchSearchTreeFromConceptHint(hint));
            }
            // Else need to check if we have an exact or approximate hint match
            else {
                const directMatchHint = hints.length === 1
                    ? hints[0]
                    : hints.find((h: AggregateConceptHintRef) => h.fullText === term);
                if (directMatchHint) {
                    dispatch(fetchSearchTreeFromConceptHint(directMatchHint));
                }
                // Else we could try getting approximate matches and choose the closest, but it may be that the user wants
                // ALL related concepts returned based on the input, so grab the tree based on the search term
                else {
                    dispatch(fetchSearchTreeFromTerms(term));
                }
            }
        }
        else {
            this.setState({ showHintsDropdown: false });
        }
        */
    }

    private handleSearchKeydown = (k: React.KeyboardEvent<HTMLInputElement>) => {
        const { selectedHintIndex, term, hints } = this.state;
        const key = (k.key === ' ' ? keys.Space : keys[k.key as any]);

        if (!key || !term.length) { return; }
        let newFocus = selectedHintIndex;

        switch (key) {
            case keys.ArrowUp: 
            case keys.ArrowDown:
                newFocus = this.handleArrowUpDownKeyPress(key, hints);
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
        this.setState({ term: '' });
    }

    private handleSearchInputChange = (e: React.FormEvent<HTMLInputElement>) => {
        this.handleSearchInput(e.currentTarget.value);
    }

    private handleSearchInput = async (term: string) => {
        this.setState({ term });
        const hints = await searchPatients(term);
        this.setState({ hints });
    }
}

const withRouter = (PatientSearch: any) => (props: Props) => {
    const params = useParams();
    const { cohortId } = params;
    return <PatientSearch cohortId={cohortId}/>;
};

export default withRouter(PatientSearch);