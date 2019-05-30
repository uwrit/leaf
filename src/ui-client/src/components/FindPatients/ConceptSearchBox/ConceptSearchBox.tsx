/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { DropdownItem, DropdownMenu, DropdownToggle, Input, InputGroup, InputGroupButtonDropdown } from 'reactstrap';
import { fetchSearchTreeFromConceptHint, fetchSearchTreeFromTerms, showDrillTree } from '../../../actions/concepts';
import { requestConceptEquivalentHint, requestConceptHints, setSearchRoot, setSearchTerm } from '../../../actions/conceptSearch';
import { ConceptsSearchState, ConceptsState } from '../../../models/state/AppState';
import { AggregateConceptHintRef } from '../../../models/concept/ConceptHint';
import { HintContainer } from './HintContainer';
import { isEmbeddedQuery } from '../../../utils/panelUtils';
import { keys } from '../../../models/Keyboard';
import LoaderIcon from '../../Other/LoaderIcon/LoaderIcon';

import './ConceptSearchBox.css';
interface Props {
    conceptsState: ConceptsState;
    conceptsSearchState: ConceptsSearchState;
    dispatch: any
}

interface State {
    debounceTimer?: NodeJS.Timer;
    roots: string[];
    selectedHintIndex: number;
    showHintsDropdown: boolean;
    showRootsDropdown: boolean;
}

export default class ConceptSearchBox extends React.PureComponent<Props, State> {
    private className = 'concept-search';
    private debounceTimeoutMs = 200;
    private minSearchCharLength = 3;
    private minNumericCharLength = 3;
    private numericRegex = /\d+/;
    private previousTerm = '';
    private previousEquivalentTerm = '';
    private termIsNumeric = false;
    constructor(props: Props) {
        super(props);
        this.state = {
            roots: [],
            selectedHintIndex: -1,
            showHintsDropdown: false,
            showRootsDropdown: false
        }
    }

    public getSnapshotBeforeUpdate() {
        const { conceptsState } = this.props;
        const { roots } = this.state;

        if (!roots.length && conceptsState.roots.length) {
            this.setState({ roots: [ '', ...conceptsState.roots.filter((r) => !isEmbeddedQuery(r)) ] });
        }
        return null;
    }

    public componentDidUpdate() { return; }

    public render() {
        const { conceptsState, conceptsSearchState, dispatch } = this.props;
        const { drillTree } = this.props.conceptsState;
        const { roots, selectedHintIndex, showHintsDropdown } = this.state;
        const c = this.className;
        const progressBarClasses = `leaf-progressbar ${conceptsState.requestingSearchTree || conceptsSearchState.isFetching ? 'show' : ''}`;
        const selectedRootDisplay = conceptsSearchState.rootId ? drillTree.get(conceptsSearchState.rootId)!.uiDisplayName : 'All Concepts';
        
        return (
            <div className={`${c}-container`}>
                <InputGroup>

                    {/* Roots dropdown (e.g. All Concepts, Demographics, etc.) */}
                    <InputGroupButtonDropdown 
                        addonType="append" 
                        className={`${c}-roots-dropdown`}
                        isOpen={this.state.showRootsDropdown} 
                        toggle={this.toggleRootsDropdown}>
                        <DropdownToggle 
                            caret={true} 
                            className={`${c}-roots-dropdown-toggle`}>
                            {selectedRootDisplay}
                        </DropdownToggle>
                        <DropdownMenu>
                            {roots.map((id: string) => {
                                const root = drillTree.get(id);
                                if (!root) { return null }
                                const display = id === ''  ? 'All Concepts' : root.uiDisplayName;
                                const classes = [ 'leaf-dropdown-item', (id === conceptsSearchState.rootId ? 'selected' : '') ]; 
                                return (
                                    <DropdownItem  className={classes.join(' ')} key={id} onClick={this.handleRootDropdownSelect.bind(null, id)}>
                                        {display}
                                    </DropdownItem>
                                )
                            })}
                        </DropdownMenu>
                    </InputGroupButtonDropdown>
                    
                    {/* Search box container */}
                    <div className={`${c}-input-container`}>

                        {/* Search input */}
                        <Input 
                            className={`${c}-input leaf-input`} 
                            onBlur={this.handleInputBlur}
                            onChange={this.handleSearchInputChange}
                            onFocus={this.handleInputFocus}
                            onKeyDown={this.handleSearchKeydown}
                            placeholder="Search..." 
                            spellCheck={false}
                            value={conceptsSearchState.term} />
                        <div className={progressBarClasses} />

                        {/* Clear search text button */}
                        {conceptsSearchState.term.length > 0 && !conceptsState.requestingSearchTree &&
                        <div className={`${c}-input-clear`}>
                            <span onClick={this.handleSearchTextClear}>✖</span>
                        </div>
                        }

                        {/* Spinnner shown when requesting a tree */}
                        {conceptsState.requestingSearchTree &&
                        <LoaderIcon />
                        }

                        {/* Search suggestions pseudo-dropdown */}
                        {showHintsDropdown && !conceptsState.requestingSearchTree &&
                        <HintContainer 
                            conceptSearchState={conceptsSearchState}
                            dispatch={dispatch}
                            handleEquivalentHintClick={this.handleEquivalentHintClick}
                            handleHintSelect={this.handleHintSelect}
                            selectedHintIndex={selectedHintIndex}
                            termIsNumeric={this.termIsNumeric}
                        />
                        }
                    </div>
                </InputGroup>
            </div>
        )
    }

    private toggleRootsDropdown = () => {
        this.setState({ showRootsDropdown: !this.state.showRootsDropdown });
    }

    private handleNumericInput = (term: string) => {
        const { dispatch } = this.props;
        const numericTerm = term
            .split(' ')
            .find((t: string) => this.numericRegex.test(t));
        
        if (numericTerm && numericTerm.length >= this.minNumericCharLength && numericTerm !== this.previousEquivalentTerm) {
            this.previousEquivalentTerm = numericTerm;
            this.termIsNumeric = true;
            dispatch(requestConceptEquivalentHint(numericTerm));
        }
    }

    private handleEquivalentHintClick = () => {
        const { dispatch, conceptsSearchState } = this.props;
        const { currentEquivalentHint } = conceptsSearchState;

        // Add the target code and first two words in text as the term
        const textSplit = currentEquivalentHint.uiDisplayTargetName.split(' ');
        const term = `${currentEquivalentHint.targetCode} ${textSplit.length >= 2 ? textSplit.slice(0,2).join(' ') : ''}`;
        const input = document.getElementsByClassName('concept-search-input') as any;

        setTimeout(() => {
            this.handleSearchInput(term);
            dispatch(fetchSearchTreeFromTerms(term));
            if (input && input[0]) {
                input[0].focus();
            }
        }, 50);
    }

    private handleRootDropdownSelect = (id: string) => {
        const { dispatch, conceptsSearchState } = this.props;
        const { term } = conceptsSearchState;
        if (id === this.props.conceptsSearchState.rootId) { return; }

        this.previousTerm = '';
        dispatch(setSearchRoot(id));
        if (term.length >= this.minSearchCharLength) {
            dispatch(fetchSearchTreeFromTerms(term));
        }
    }

    private handleHintSelect = (hint: AggregateConceptHintRef) => {
        const { dispatch } = this.props;
        dispatch(setSearchTerm(hint.fullText));
        if (hint.fullText !== this.previousTerm) {
            dispatch(fetchSearchTreeFromConceptHint(hint));
            this.previousTerm = hint.fullText;
        }
    }

    private handleInputFocus = () => this.setState({ showHintsDropdown: true });

    private handleInputBlur = () => this.setState({ showHintsDropdown: false });

    private handleArrowUpDownKeyPress = (key: number, hints: AggregateConceptHintRef[]) => {
        const { showHintsDropdown, selectedHintIndex } = this.state;
        const { dispatch } = this.props;
        if (!showHintsDropdown) { return selectedHintIndex; }

        const currentFocus = this.state.selectedHintIndex;
        const hintCount = hints.length;
        const minFocus = 0;
        const maxFocus = hintCount - 1;
        const newFocus = key === keys.ArrowUp
            ? currentFocus === minFocus ? maxFocus : currentFocus - 1
            : currentFocus === maxFocus ? minFocus : currentFocus + 1;
            
        if (hints[newFocus]) {
            dispatch(setSearchTerm(hints[newFocus].fullText));
        }
        return newFocus;
    }

    private handleEnterKeyPress = (term: string, hints: AggregateConceptHintRef[]) => {
        const { conceptsSearchState, dispatch } = this.props;
        const { debounceTimer, selectedHintIndex } = this.state;

        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        if (term && term !== this.previousTerm) {
            this.previousTerm = term;
            const hint = conceptsSearchState.currentHints[selectedHintIndex];
            this.setState({ selectedHintIndex: -1, showHintsDropdown: false });

            // If a hint is currently focused, find its tree
            if (hint) {
                dispatch(fetchSearchTreeFromConceptHint(hint));
            }
            // Else need to check if we have an exact or approximate hint match
            else {
                const directMatchHint = hints.length === 1
                    ? hints[0]
                    : hints.find((h: AggregateConceptHintRef) => h.fullText === term);
                if (directMatchHint) {
                    dispatch(fetchSearchTreeFromConceptHint(directMatchHint));
                }
                // Else we could try getting approximate matches and choose the closest, but it may be that the user wants
                // ALL related concepts returned based on the input, so grab the tree based on the search term
                else {
                    dispatch(fetchSearchTreeFromTerms(term));
                }
            }
        }
        else {
            this.setState({ showHintsDropdown: false });
        }
    }

    private handleSpacebarKeyPress = (term: string, newFocus: number, hints: AggregateConceptHintRef[]) => {
        const { dispatch } = this.props;

        if (hints[newFocus]) {
            this.setState({ selectedHintIndex: -1 });
            dispatch(setSearchTerm(hints[newFocus].fullText));
            dispatch(requestConceptHints(term));
        }
    }

    private handleSearchKeydown = (k: React.KeyboardEvent<HTMLInputElement>) => {
        const { conceptsSearchState } = this.props;
        const { selectedHintIndex } = this.state;
        const { term, currentHints } = conceptsSearchState;
        const key = (k.key === ' ' ? keys.Space : keys[k.key as any]);

        if (!key || term.length < this.minSearchCharLength) { return; }
        let newFocus = selectedHintIndex;

        switch (key) {
            case keys.ArrowUp: 
            case keys.ArrowDown:
                newFocus = this.handleArrowUpDownKeyPress(key, currentHints);
                k.preventDefault();
                break;
            case keys.Backspace:
                newFocus = -1;
                break;
            case keys.Enter:
                this.handleEnterKeyPress(term, currentHints);
                break;
            case keys.Space:
                this.handleSpacebarKeyPress(term, newFocus, currentHints);
                break;
            case keys.Escape:
                this.handleSearchTextClear();
                break;
        }
        if (newFocus !== selectedHintIndex) {
            this.setState({ selectedHintIndex: newFocus });
        }
    }

    private handleSearchTextClear = () => {
        const { dispatch } = this.props;
        dispatch(setSearchTerm(''));
        dispatch(showDrillTree());
    }

    private handleSearchInputChange = (e: React.FormEvent<HTMLInputElement>) => {
        this.handleSearchInput(e.currentTarget.value);
    }

    private handleSearchInput = (term: string) => {
        const { dispatch } = this.props;
        const { debounceTimer } = this.state;
        dispatch(setSearchTerm(term));

        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        if (term.length >= this.minSearchCharLength) {
            this.setState({
                showHintsDropdown: true,
                debounceTimer: setTimeout(() => {
                    dispatch(requestConceptHints(term));
                    if (this.numericRegex.test(term)) {
                        this.handleNumericInput(term);
                    } else {
                        this.termIsNumeric = false;
                        this.previousEquivalentTerm = '';
                    }
                }, this.debounceTimeoutMs)
            });
        } else if (!term.length) {
            dispatch(showDrillTree());
            this.setState({ showHintsDropdown: false });
        }
    }
}