/* Copyright (c) 2019, UW Medicine Research IT
 * Developed by Nic Dobbins and Cliff Spital
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
    constructor(props: Props) {
        super(props);
    }
    
    public render() {
        const { conceptSearchState, handleEquivalentHintClick, handleHintSelect, selectedHintIndex, termIsNumeric } = this.props;
        const { currentHints, currentEquivalentHint } = conceptSearchState;
        const c = this.className;
        const abbreviate =  conceptSearchState.term.length > 50;
        const paddedAbbreviation = <span style={{ paddingLeft: 50 }}>...</span>

        return (
            <div className={`${c}-hint-container`}>

                {/* 'Possible Equivalent of' ICD9->10 or ICD10->9 suggestion */}
                {termIsNumeric && currentEquivalentHint.targetCode && 
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

                            {/*
                            {rootId === '' && 
                             hint.rootIds.length &&
                            <span className={`${c}-hint-item-root`}>
                                in {hint.rootIds.map((r: string) => { const d = tree.get(r); return d && d.uiDisplayName }).join(', ')}
                            </span>
                            }
                            */}

                            {/* Matching concepts count */}
                            <span className={`${c}-hint-item-count`}>
                                <strong>{hint.ids.length > 20 ? '20+' : hint.ids.length}</strong> concept(s)
                            </span>
                    </div>)
                })}
            </div>
        );
    }
}