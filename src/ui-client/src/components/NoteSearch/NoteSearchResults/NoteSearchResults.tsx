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
                Object.entries(results).map(([result, val], i) => {
                    console.log("render")
                    console.log(val[i].documentPositions[i].context)
                    return (
                    <div key={i} className={`${c}-result`}>
                        <div className={`${c}-result-header`}>
                        <div key={result}>
                            {
                                <p>out: {val[i].documentPositions[i].context}</p>
                            }
                            </div>
                        </div>
                        </div>
                    );
                })
                           
        );
    }
}