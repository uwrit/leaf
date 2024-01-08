import React from 'react';
import { NoteSearchState } from '../../../models/state/CohortState';
import { Col, Container, Row } from 'reactstrap';
import { createPortal } from 'react-dom';
import { DocumentSearchResult } from '../../../providers/noteSearch/noteSearchWebWorker';
import Paginate from '../../PatientList/Paginate';
import { setNoteSearchPagination } from '../../../actions/cohort/noteSearch';
import './NoteSearchResults.css';

interface Props {
    dispatch: any;
    noteSearch: NoteSearchState;
}

interface State {
    showFullNoteModal: boolean;
    note?: DocumentSearchResult;
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
        const { configuration, results, terms } = this.props.noteSearch;
        const { showFullNoteModal, note } = this.state;
        const c = this.className;
        let noDataBox;

        if (terms.length === 0 && results.totalDocuments === 0) {
            noDataBox = (
                <div className={`${c}-no-terms`}>
                    <p>
                        Click "+ Add More Data" to add types of documents to search through, then enter terms to search for in the upper-right
                    </p>
                </div>
            );
        } else if (terms.length && results.totalDocuments === 0) {
            noDataBox = (
                <div className={`${c}-no-hits`}>
                    <p>
                        Whoops! Looks like that search didn't find any documents
                    </p>
                </div>
            );
        } else if (configuration.datasets.length && !terms.length) {
            noDataBox = (
                <div className={`${c}-no-hits`}>
                    <p>
                        Enter search terms in the upper-right
                    </p>
                </div>
            );
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
                                Click on a note to view the full contents in detail
                            </div>
                        </div>
                        }
                    </Col>
                    <Col md={6}>
                        {paginate}
                    </Col>
                </Row>
                }
                {noDataBox}
                {results.documents.map(d => {
                    return (
                        <div key={d.id} className={`${c}-document`} onClick={this.handleNoteClick.bind(null, d)}>
                            <div className={`${c}-document-header`}>
                                <div>{d.note_type}</div>
                                <div>{d.date ? d.date.toLocaleDateString("en-US") : null}</div>
                            </div>
                                {d.lines.map((l,i) => {
                                    return (
                                        <Row key={i} className={`${c}-line`}>
                                            <Col md={1} className={`${c}-line-number`}>{l.index+1}</Col>
                                            <Col md={11} className={`${c}-line-context`}>
                                                {l.content.map((s,si) => {
                                                    switch (s.type) {
                                                        case "CONTEXT": 
                                                            return <span className={`${c}-context`} key={si}>{s.text}</span>;
                                                        default:        
                                                            const color = s.matchedTerm.color;
                                                            return (
                                                                <span 
                                                                    className={`${c}-match`} 
                                                                    key={si}
                                                                    style={{ backgroundColor: color.replace(')',',0.1)'), borderColor: color }}>
                                                                        {s.text}
                                                                </span>
                                                            );
                                                    }
                                                })}
                                            </Col>
                                        </Row>
                                    );
                                })}
                        </div>
                    )
                })}
                <Row>
                    <Col md={6}/>
                    <Col md={6}>
                        {paginate}
                    </Col>
                </Row>
                {/*createPortal(
                    <div className={`${c}-modal ${showFullNoteModal ? 'show' : ''}`}>
                        {note && 
                        <div>
                            <textarea readOnly={true} content={note.text}/>
                        </div>
                        }
                    </div>
                    , document.body)*/}
            </Container>
        )
    }

    private handleNoteClick = (note: DocumentSearchResult) => {
        this.setState({ note, showFullNoteModal: true });
    }

    private handlePageCountClick = (data: any) => {
        const { dispatch, noteSearch } = this.props;
        const page = data.selected;
        if (page !== noteSearch.configuration.pageNumber) {
            dispatch(setNoteSearchPagination(page));
        }
    }
}