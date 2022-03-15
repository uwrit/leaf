import React from 'react';
import { Input, InputGroup } from 'reactstrap';
import { DemographicRow } from '../../../models/cohortData/DemographicDTO';
import { keys } from '../../../models/Keyboard';
import { searchPatients } from '../../../services/patientSearchApi';
import { useParams, useNavigate, NavigateFunction } from "react-router-dom";
import HintContainer from './HintContainer';
import './PatientSearch.css';

interface Props {
    cohortId?: string;
    nav?: NavigateFunction;
}

interface State {
    hints: DemographicRow[];
    selectedHintIndex: number,
    showHintsDropdown: boolean,
    term: string
}

class PatientSearch extends React.PureComponent<Props, State> {
    private className = 'patient-search';
    private hintLimit = 5;

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

    private handleInputFocus = async () => {
        const { term } = this.state;
        this.setState({ showHintsDropdown: true });

        const hints = await searchPatients(term, this.hintLimit);
        this.setState({ hints });
    };

    private handleInputBlur = () => {
        setTimeout(() => this.setState({ showHintsDropdown: false }), 100);
    };

    private handleArrowUpDownKeyPress = (key: number) => {
        const { showHintsDropdown, selectedHintIndex, hints } = this.state;
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
        const { cohortId, nav } = this.props;
        const { selectedHintIndex, hints } = this.state;
        const selected = hints[selectedHintIndex];

        if (selected && nav) {
            const patientId = selected.personId;
            nav(`/${cohortId}/patients/${patientId}`);
        }
    }

    private handleSearchKeydown = (k: React.KeyboardEvent<HTMLInputElement>) => {
        const { selectedHintIndex, term } = this.state;
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
        this.setState({ term: '' });
    }

    private handleSearchInputChange = (e: React.FormEvent<HTMLInputElement>) => {
        this.handleSearchInput(e.currentTarget.value);
    }

    private handleSearchInput = async (term: string) => {
        this.setState({ term });
        const hints = await searchPatients(term, this.hintLimit);
        this.setState({ hints, selectedHintIndex: hints.length ? 0 : -1 });
    }
}

const withRouter = (PatientSearch: any) => (props: Props) => {
    const params = useParams();
    const nav = useNavigate();
    const { cohortId } = params;
    return <PatientSearch cohortId={cohortId} nav={nav} />;
};

export default withRouter(PatientSearch);