import React from 'react';
import { NoteSearchState, RadixSearchResult } from '../../../models/state/CohortState';
import { NoteSearchDatasetQuery } from '../../../models/patientList/Dataset';
import { DateBoundary, DateIncrementType } from '../../../models/panel/Date';
import { Container, Col, Row, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Button } from 'reactstrap';
import CheckboxSlider from '../../Other/CheckboxSlider/CheckboxSlider';
import { setNoteDatasetChecked, getNotes } from '../../../actions/cohort/noteSearch';
import CustomDateRangePicker from '../../FindPatients/Panels/CustomDateRangePicker';
import { pastDates, none } from '../../FindPatients/Panels/DateDropdownOptions';
import { SearchTermEditor } from '../SearchTermEditor/SearchTermEditor';
import './NoteSearchHeader.css';

interface Props {
    dispatch: any;
    noteSearch: NoteSearchState;
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
        const { dispatch, noteSearch} = this.props;
        const { DOMRect, dateFilterOpen, noteSelectorOpen, showCustomDateRangeBox } = this.state;
        const datasets = [ ...noteSearch.datasets.values() ];
        const selectedCount = datasets.filter(ds => ds.checked).length;
        const customDateFilterClasses = `leaf-dropdown-item ${noteSearch.dateFilter.start.dateIncrementType === DateIncrementType.SPECIFIC ? 'selected' : ''}`;
        const anytimeDateFilterClasses = `leaf-dropdown-item ${noteSearch.dateFilter.start.dateIncrementType === DateIncrementType.NONE ? 'selected' : ''}`;
        const anytime: DateBoundary = { start: none, end: none };
        const c = this.className;
                                                                                                                                                                                                                                                                  


        return (
            <Container className={c} fluid={true}>
                <Row>
                    <Col md={6}>

                        {/* Left side */}
                        <Row>

                            {/* Left-left - Note type and date selectors */}
                            <Col md={6}>

                                {/* Note type selector */}
                                <Dropdown 
                                    className={`${c}-note-type-dropdown`}
                                    isOpen={noteSelectorOpen} 
                                    toggle={this.toggleNoteSelector}
                                    >
                                    <DropdownToggle caret={true}>
                                        Select Note Types ({selectedCount} current)
                                    </DropdownToggle>
                                    <DropdownMenu className={`${c}-note-type-selector`}>
                                        {datasets.map(ds => {
                                            return (
                                                <div key={ds.id} className={`${c}-note-type`}
                                                    onClick={this.handleDatasetCheckClick.bind(null, ds)}>
                                                    <Row>
                                                        <Col md={3}>
                                                            <CheckboxSlider 
                                                                checked={ds.checked} 
                                                                onClick={this.handleDatasetCheckClick.bind(null, ds)}
                                                            />
                                                        </Col>
                                                        <Col md={9}>
                                                            {ds.name}
                                                        </Col>
                                                    </Row>
                                                </div>
                                            );
                                        })}
                                    </DropdownMenu>
                                </Dropdown>

                                {/* Date filter */}
                                <Dropdown 
                                    className={`${c}-date-dropdown`}
                                    isOpen={dateFilterOpen} 
                                    toggle={this.toggleDateFilterSelector}
                                    >
                                    <DropdownToggle caret={true}>
                                        {noteSearch.dateFilter.display}
                                    </DropdownToggle>
                                    <DropdownMenu className={`${c}-note-date-selector`}>
                                    <DropdownItem className={anytimeDateFilterClasses} onClick={null}>Anytime</DropdownItem>
                                        <DropdownItem divider={true} />
                                        <DropdownItem className={customDateFilterClasses} onClick={null}>Custom Date Range</DropdownItem>
                                        <DropdownItem divider={true} />
                                        {pastDates.map((opt) => (
                                            <DropdownItem className={this.setDateDropdownItemClasses(opt)} key={opt.display} onClick={null}>{opt.display}</DropdownItem>
                                        ))}
                                    </DropdownMenu>
                                </Dropdown>
                                {showCustomDateRangeBox &&
                                <CustomDateRangePicker
                                    dateFilter={noteSearch.dateFilter}
                                    handleDateRangeSelect={null}
                                    parentDomRect={DOMRect!}
                                    toggleCustomDateRangeBox={this.toggleDateFilterSelector}
                                />
                                }
                            </Col>

                            {/* Get notes button */}
                            <Col md={6}>
                                
                            <Button className='leaf-button leaf-button-addnew' disabled={false} onClick={this.handleLoadNotesClick}>
                                Load Notes
                                
                            </Button>

                            </Col>

                        </Row>

                    </Col>

                    {/* Right side */}
                    <Col md={6}>
/:v
                            {/* Search terms */}
                            <SearchTermEditor dispatch={dispatch} terms={noteSearch.terms}/>
                    </Col>
                </Row>
            </Container>
        );
    }

    private handleLoadNotesClick = () => {
        const { dispatch } = this.props;
        dispatch(getNotes());
 
    }

    private setDateDropdownItemClasses = (dates: DateBoundary) => {
        const { dateFilter } = this.props.noteSearch;
        return `leaf-dropdown-item ${
            dates.start.dateIncrementType === dateFilter.start.dateIncrementType &&
            dates.start.increment! === dateFilter.start.increment! &&
            dates.end.dateIncrementType === dateFilter.end.dateIncrementType &&
            dates.end.increment! === dateFilter.end.increment!
            ? 'selected' : ''
        }`;
    }

    private handleCustomDateSelectionClick = (e: any) => {
        const domRect: DOMRect = e.target.getBoundingClientRect();
        this.setState({ 
            DOMRect: domRect, 
            showCustomDateRangeBox: true
        });
    }

    private toggleDateFilterSelector = () => {
        this.setState({ dateFilterOpen: !this.state.dateFilterOpen });
    }

    private toggleNoteSelector = () => {
        this.setState({ noteSelectorOpen: !this.state.noteSelectorOpen });
    }

    private handleDatasetCheckClick = (dataset: NoteSearchDatasetQuery) => {
        const { dispatch } = this.props;
        dispatch(setNoteDatasetChecked(dataset.id));
    }

    private setDateFilter = (dateFilter: DateBoundary) => {

    }
}