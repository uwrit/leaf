import React from 'react';
import { NoteSearchState } from '../../../models/state/CohortState';
import TextareaAutosize from 'react-textarea-autosize';
import './NoteSearchResults.css';
import { Col, Container, Row } from 'reactstrap';

interface Props {
    dispatch: any;
    noteSearch: NoteSearchState;
}

export class NoteSearchResults extends React.PureComponent<Props> {
    private className = 'note-search-results';
    
    public render() {
        const { results, terms } = this.props.noteSearch;
        const c = this.className;

        return (
            <Container className={`${c}-container`} fluid={true}>
                {results.documents.map(d => {
                    return (
                        <div key={d.id} className={`${c}-document`}>
                            <div className={`${c}-document-header`}>
                                <span></span>
                            </div>
                                {d.lines.map(l => {
                                    return (
                                        <Row key={l.index} className={`${c}-line`}>
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
            </Container>
        )
    }
}