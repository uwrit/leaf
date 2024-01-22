import React from 'react';
import { NoteSearchState } from '../../../models/state/CohortState';
import { Col, Container, Modal, ModalBody, ModalFooter, ModalHeader, Row } from 'reactstrap';
import { SearchResultDocument } from '../../../providers/noteSearch/noteSearchWebWorker';
import Paginate from '../../PatientList/Paginate';
import { getHighlightedNote, setFullNote, setNoteSearchPagination } from '../../../actions/cohort/noteSearch';
import { NoteSearchResultDocument } from './NoteSearchResultDocument';
import './NoteSearchResults.css';

interface Props {
    dispatch: any;
    noteSearch: NoteSearchState;
}

interface State {
    showFullNoteModal: boolean;
}

export class NoteSearchResults extends React.PureComponent<Props, State> {
    private className = 'note-search-results';

    public constructor(props: Props) {
        super(props);
        this.state = {
            showFullNoteModal: false
        }
    }
    
    public render() {
        const { dispatch, noteSearch } = this.props;
        const { configuration, results, terms, fullNote } = this.props.noteSearch;
        const { showFullNoteModal } = this.state;
        const c = this.className;
        let noDataText;

        if (terms.length === 0 && results.totalDocuments === 0) {
            noDataText = 'Click "+ Add More Data" to add types of documents to search through, then enter terms to search for in the upper-right';
        } else if (terms.length && results.totalDocuments === 0) {
            noDataText = "Whoops! Looks like that search didn't find any documents";
        } else if (configuration.datasets.size && !terms.length) {
            noDataText = "Enter search terms in the upper-right";
        }

        let paginate;
        if (results.documents.length && results.totalDocuments > noteSearch.configuration.pageSize) {
            paginate = 
                <Paginate 
                    dispatch={dispatch}
                    handlePageCountClick={this.handlePageCountClick}
                    pageNumber={configuration.pageNumber}
                    pageSize={configuration.pageSize}
                    totalElements={results.totalDocuments}
                />;
        }

        return (
            <Container className={`${c}-container`} fluid={true}>
                {results.totalDocuments > 0 &&
                <Row>
                    <Col md={6}>
                        {noteSearch.results.totalDocuments &&
                        <div>
                            <div className={`${c}-doccount-container`}>
                                <span>Found </span>
                                <span className={`${c}-doccount`}>{noteSearch.results.totalDocuments.toLocaleString()} notes</span>
                                <span> for </span>
                                <span className={`${c}-doccount`}>{noteSearch.results.totalPatients.toLocaleString()} unique patients</span>
                            </div>
                            <div className={`${c}-info`}>
                                Click on a note to view full contents in detail
                            </div>
                        </div>
                        }
                    </Col>
                    <Col md={6}>
                        {paginate}
                    </Col>
                </Row>
                }
                {noDataText && 
                <div className={`${c}-no-hits`}>
                    <p>
                        {noDataText}
                    </p>
                </div>}

                {/* Documents */}
                {results.documents.map(d => 
                    <NoteSearchResultDocument 
                        key={d.id}
                        document={d} 
                        noteClickHandler={this.handleNoteClick} 
                    />)
                }
                <Row>
                    <Col md={6}/>
                    <Col md={6}>
                        {paginate}
                    </Col>
                </Row>  

                <Modal 
                    className={`${c}-fullnote-modal`}
                    isOpen={fullNote && showFullNoteModal} 
                    backdrop={false}
                    onBlur={this.handleCloseModalClick.bind(null)}>
                    <ModalHeader>
                        <div 
                            className={`${c}-fullnote-modal-close`} 
                            onClick={this.handleCloseModalClick.bind(null)}>
                            ✕
                        </div>
                    </ModalHeader>
                    <ModalBody>
                        {fullNote &&
                        <NoteSearchResultDocument document={fullNote} />               
                        }
                    </ModalBody>
                </Modal>

            </Container>
        )
    }

    private handleCloseModalClick = () => {
        const { dispatch } = this.props;
        this.setState({ showFullNoteModal: false });
        dispatch(setFullNote());
    }

    private handleNoteClick = (note: SearchResultDocument) => {
        const { dispatch } = this.props;
        this.setState({ showFullNoteModal: true });
        dispatch(getHighlightedNote(note));
    }

    private handlePageCountClick = (data: any) => {
        const { dispatch, noteSearch } = this.props;
        const page = data.selected;
        if (page !== noteSearch.configuration.pageNumber) {
            dispatch(setNoteSearchPagination(page));
        }
    }
}