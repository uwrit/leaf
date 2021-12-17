/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { AggregateConceptHintRef } from '../../../models/concept/ConceptHint';
import { ConceptsSearchState } from '../../../models/state/AppState';

interface Props {
    conceptSearchState: ConceptsSearchState;
    dispatch: any;
    handleEquivalentHintClick: () => any;
    handleHintSelect: (hint: AggregateConceptHintRef) => any;
    selectedHintIndex: number;
    termIsNumeric: boolean;
}

export class HintContainer extends React.PureComponent<Props> {
    private className = 'concept-search';
    
    public render() {
        const { conceptSearchState, handleEquivalentHintClick, handleHintSelect, selectedHintIndex, termIsNumeric } = this.props;
        const { currentHints, currentEquivalentHint } = conceptSearchState;
        const c = this.className;
        const abbreviate =  conceptSearchState.term.length > 50;
        const paddedAbbreviation = <span style={{ paddingLeft: 50 }}>...</span>

        return (
            <div className={`${c}-hint-container`}>

                {/* 'Possible Equivalent of' ICD9->10 or ICD10->9 suggestion */}
                {conceptSearchState.term.length > 0 && termIsNumeric && currentEquivalentHint.targetCode &&
                 <div className={`${c}-hint-equivalent`}>
                    <span className={`${c}-hint-equivalent-text`}>Possible equivalent of </span>
                    <span 
                        className={`${c}-hint-equivalent-value`}
                        onMouseDown={handleEquivalentHintClick}>
                        <strong>{currentEquivalentHint.targetCodeType}: {currentEquivalentHint.targetCode} - </strong>
                        {currentEquivalentHint.uiDisplayTargetName}
                    </span>
                 </div>}

                {/* Main suggested hints */}
                {currentHints.map((hint: AggregateConceptHintRef, i: number) => {
                    const len = hint.ids.length;
                    return (
                    <div 
                        className={`${c}-hint-item leaf-dropdown-item ${i === selectedHintIndex ? 'selected' : ''}`} 
                        key={hint.fullText} onMouseDown={handleHintSelect.bind(null, hint)}>

                            {/* Text */}
                            {!abbreviate 
                                ? <span>{hint.text} </span>
                                : paddedAbbreviation
                            }
                            <span><strong>{hint.suggestion}</strong></span>

                            {/* Matching concepts count */}
                            <span className={`${c}-hint-item-count`}>
                                <strong>{len > 20 ? '20+' : len}</strong> concept{len > 1 && 's'}
                            </span>
                    </div>)
                })}
            </div>
        );
    }
}