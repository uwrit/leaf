import React from 'react';
import { NoteSearchState } from '../../../models/state/CohortState';
import TextareaAutosize from 'react-textarea-autosize';
import './NoteSearchResults.css';

interface Props {
    dispatch: any;
    noteSearch: NoteSearchState;
}

export class NoteSearchResults extends React.PureComponent<Props> {
    private className = 'note-search-results';
    
    public render() {
        const { results } = this.props.noteSearch;
        const c = this.className;

        return (
            <div>
                {results.documents.map(d => {
                    return (
                        <div key={d.id} className={`${c}-document-pointer`}>
                            {d.lines.map((l,i) => {
                                return (
                                    <div key={i} className={`${c}-line`}>
                                        {l.map((s,si) => {
                                            return <span key={si}>{s.text}</span>
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    )
                })}
            </div>
        )
    }
}