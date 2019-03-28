/* Copyright (c) 2019, UW Medicine Research IT
 * Developed by Nic Dobbins and Cliff Spital
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Dispatch } from 'redux';
import { fetchConceptChildrenIfNeeded, handleConceptClick } from '../../../actions/concepts';
import { ConceptMap } from '../../../models/state/AppState';
import { Concept } from '../../../models/concept/Concept';
import ConceptTreeNode from './ConceptTreeNode';
import './ConceptTree.css';

interface Props {
    allowRerender: Set<string>;
    dispatch: Dispatch<any>
    roots: string[];
    tree: ConceptMap;
    selectedId: string;
}

export default class ConceptTree extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
    }

    public render() {
        const { tree, allowRerender, selectedId } = this.props;
        const roots = this.props.roots
            .map(id => tree.get(id)!)
            .sort((a: Concept, b: Concept) => a.uiDisplayName.localeCompare(b.uiDisplayName));

        return (
            <div className="concept-tree">
                {roots.map((concept: Concept) => (
                    <ConceptTreeNode 
                        allowRerender={allowRerender}
                        key={concept.id} 
                        concept={concept}
                        concepts={tree}
                        onClick={this.handleClick}
                        onArrowClick={this.handleArrowClick}
                        parentShown={true}
                        selectedId={selectedId} 
                    />
                ))}
            </div>
        );
    }

    private handleClick = (concept: Concept) => {
        const { dispatch } = this.props;
        dispatch(handleConceptClick(concept));
    }

    private handleArrowClick = (concept: Concept) => {
        const { dispatch } = this.props;
        dispatch(fetchConceptChildrenIfNeeded(concept));
    }
}

