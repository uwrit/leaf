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
            <div className={c}>
                {
                /**results.map((result, i) => {
                    return (
                        <div key={i} className={`${c}-result`}>
                            <div className={`${c}-result-header`}>
                                <span className={`${c}-result-type`}>{result.note.type}</span>
                                <span className={`${c}-result-date`}>{result.note.date}</span>
                            </div>
                            <div className={`${c}-result-body`}>
                                <TextareaAutosize
                                    readOnly={true}
                                    spellCheck={false}
                                    value={result.note.text}>
                                </TextareaAutosize>
                            </div>
                        </div>
                    );
                })*/
                <div>
                <div>{  JSON.stringify(Object.entries(results)
  .map( ([key, value]) => `My key is ${key} and my value is ${JSON.stringify(value[0].documentTexts[0]['documentText'])}` ))
  
  }
                </div>
            </div>
                }
            </div>
        );
    }

}