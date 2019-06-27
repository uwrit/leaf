/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Dispatch } from 'redux';
import { ConceptMap } from '../../../models/state/AppState';
import { Concept } from '../../../models/concept/Concept';
import ConceptTreeNode from './ConceptTreeNode';
import './ConceptTree.css';

interface Props {
    allowReparent: boolean;
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
        const { tree, allowReparent, allowRerender, dispatch, selectedId } = this.props;
        const roots = this.props.roots
            .map(id => tree.get(id)!)
            .sort((a: Concept, b: Concept) => a.uiDisplayName > b.uiDisplayName ? 1 : -1);

        return (
            <div className="concept-tree">
                {roots.map((concept: Concept) => {
                    if (!concept) { return null; }
                    return (
                        <ConceptTreeNode 
                            allowReparent={allowReparent}
                            allowRerender={allowRerender}
                            key={concept.id} 
                            concept={concept}
                            concepts={tree}
                            dispatch={dispatch}
                            parentShown={true}
                            selectedId={selectedId} 
                        />
                )})}
            </div>
        );
    }
}

