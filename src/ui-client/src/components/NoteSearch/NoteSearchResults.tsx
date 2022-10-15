import React from 'react';
import { NoteSearchState } from '../../models/state/CohortState';
import './NoteSearchResults.css';

interface Props {
    dispatch: any;
    noteSearch: NoteSearchState;
}

export class NoteSearchResults extends React.PureComponent<Props> {
    private className = 'note-search-results';
    
    public render() {
        const { matched } = this.props.noteSearch;
        const c = this.className;

        return (
            <div className={c}>
                Test
            </div>
        );
    }

}