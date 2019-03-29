/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import ConceptSearchBox from '../../components/FindPatients/ConceptSearchBox/ConceptSearchBox';
import ConceptTree from '../../components/FindPatients/ConceptTree/ConceptTree';
import { AppState, ConceptsSearchState, ConceptsState } from '../../models/state/AppState';

interface StateProps {
    concepts: ConceptsState;
    conceptSearch: ConceptsSearchState;
}

interface DispatchProps {
    dispatch: any;
}

interface OwnProps { }

type Props = StateProps & DispatchProps & OwnProps;

class ConceptTreeColumn extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
    }

    public render() {
        const { concepts, conceptSearch, dispatch } = this.props;
        const tree = this.props.concepts.currentTree;
        const roots = !concepts.showSearchTree
            ? concepts.roots
            : concepts.roots.filter((root: string) => concepts.searchTree.has(root));

        return (
            <div className="concept-tree-column">
                <ConceptSearchBox 
                    conceptsState={concepts} 
                    conceptsSearchState={conceptSearch}
                    dispatch={dispatch} 
                />
                <ConceptTree
                    allowRerender={concepts.allowRerender}
                    tree={tree}
                    dispatch={dispatch}
                    roots={roots} 
                    selectedId={concepts.selectedId}
                />
            </div>
        );
    }
}

const mapStateToProps = (state: AppState): StateProps => {
    return {
        conceptSearch: state.conceptSearch,
        concepts: state.concepts
    };
}

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => {
    return {
        dispatch
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ConceptTreeColumn);