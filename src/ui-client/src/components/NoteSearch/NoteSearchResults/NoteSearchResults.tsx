import React from 'react';
import { NoteSearchState } from '../../../models/state/CohortState';
import { Col, Container, Row } from 'reactstrap';
import { Note } from '../../../models/cohort/NoteSearch';
import { createPortal } from 'react-dom';
import { DocumentSearchResult } from '../../../providers/noteSearch/noteSearchWebWorker';
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
        const { results, terms } = this.props.noteSearch;
        const { showFullNoteModal, note } = this.state;
        const c = this.className;
        return (
            <Container className={`${c}-container`} fluid={true}>
                {results.documents.map(d => {
                    return (
                        <div key={d.id} className={`${c}-document`} onClick={this.handleNoteClick.bind(null, d)}>
                            <div className={`${c}-document-header`}>
                                <span><p>Note ID: {d.id}</p>
                                <p> Written Date: {d.date}</p>
                                <p> Note Type: {d.note_type}</p>
                                </span>
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
                {createPortal(
                    <div className={`${c}-modal ${showFullNoteModal ? 'show' : ''}`}>
                        {note && 
                        <div>
                            <textarea readOnly={true} content={note.text}/>
                        </div>
                        }
                    </div>
                , document.body)}
            </Container>
        )
    }

    private handleNoteClick = (note: DocumentSearchResult) => {
        this.setState({ note, showFullNoteModal: true });
    }
}