import React from 'react';
import { SearchResultDocument } from '../../../providers/noteSearch/noteSearchWebWorker';
import { Col, Row } from 'reactstrap';

interface Props {
    noteClickHandler?: (d: SearchResultDocument) => any;
    document: SearchResultDocument;
}

export class NoteSearchResultDocument extends React.PureComponent<Props> {
    private className = 'note-search-results';

    public render() {
        const { document } = this.props;
        const c = this.className;

        return (
            <div className={`${c}-document`} onClick={this.handleNoteClick.bind(null)}>
                <div className={`${c}-document-header`}>
                    <div>{document.type}</div>
                    <div>{document.date ? document.date.toLocaleDateString("en-US") : null}</div>
                </div>

                    {/* Lines within document */}
                    {document.lines.map((l,i) => {
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
    }

    private handleNoteClick = () => {
        const { document, noteClickHandler } = this.props;
        if (noteClickHandler) {
            noteClickHandler(document);
        }
    }
}