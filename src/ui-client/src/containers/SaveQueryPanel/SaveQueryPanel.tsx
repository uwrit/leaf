/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { connect } from 'react-redux';
import { Button, FormGroup, Input, Label } from 'reactstrap';
import { Dispatch } from 'redux';
import { toggleSaveQueryPane } from '../../actions/generalUi';
import { setCurrentQuery, requestQuerySave, setRunAfterSave } from '../../actions/queries';
import RightPaneSlider from '../../components/Other/RightPaneSlider/RightPaneSlider';
import { AppState } from '../../models/state/AppState';
import { SavedQueriesState, Query, SavedQuery } from '../../models/Query';
import './SaveQueryPanel.css';

interface State {
    categoryError: boolean;
    nameError: boolean;
}
interface StateProps {
    queries: SavedQueriesState;
    show: boolean;
}
interface DispatchProps {
    dispatch: Dispatch<any>;
}
interface OwnProps {}
type Props = StateProps & DispatchProps & OwnProps;

class SaveQueryPanel extends React.PureComponent<Props, State> {
    private className = 'save-query-panel'
    constructor(props: Props) {
        super(props);
        this.state = {
            categoryError: false,
            nameError: false
        }
    }

    public render() {
        const { current } = this.props.queries;
        const { categoryError, nameError } = this.state;
        const c = this.className;
        const tabIndex = this.props.show ? 0 : -1;
        const nameClasses = [ 'leaf-input' ];
        const catClasses = [ 'leaf-input' ];
        let namePlaceholder = "e.g., Heart Failure and > 65 y/o";
        let catPlaceholder = "e.g., Cardiovascular";

        if (nameError) {
            nameClasses.push('error');
            namePlaceholder = "Enter a name for your query";
        }
        if (categoryError) {
            catClasses.push('error');
            catPlaceholder = "Enter a category for your query (e.g., IRB number or theme of query)"
        }

        return (
            <RightPaneSlider
                show={this.props.show}
                toggle={this.toggle}>
                <div className={`${c}-container`}>
                    <FormGroup>
                        <Label for={`${c}-name`}>
                            Query Name
                            <span className="required-field">*</span>
                        </Label>
                        <Input 
                            className={nameClasses.join(' ')}
                            autoComplete="off"
                            type="text" 
                            id={`${c}-name`}
                            onChange={this.handleQueryNameChange}
                            onKeyDown={this.handleKeydown}
                            placeholder={namePlaceholder}
                            spellCheck={false}
                            tabIndex={tabIndex}
                            value={current.name} />
                    </FormGroup>
                    <FormGroup>
                        <Label for={`${c}-category`}>
                            Category
                            <span className="required-field">*</span>
                        </Label>
                        <Input 
                            className={catClasses.join(' ')}
                            autoComplete="off"
                            type="text" 
                            id={`${c}-category`} 
                            onChange={this.handleQueryCategoryChange}
                            onKeyDown={this.handleKeydown}
                            placeholder={catPlaceholder}
                            spellCheck={false} 
                            tabIndex={tabIndex}
                            value={current.category} />
                    </FormGroup>
                    {/*<FormGroup>
                        <Label for={`${c}-description`}>Description</Label>
                        <Input 
                            className="leaf-input leaf-input-textarea"
                            type="textarea"
                            id={`${c}-description`} 
                            onChange={this.handleQueryDescriptionChange}
                            placeholder="Patients with HF dx AND current age over 65"
                            spellCheck={false} 
                            tabIndex={tabIndex}
                            value={currentQuery.description} />
                    </FormGroup>*/}
                    <div className="required-field-tag">* Required</div>
                    <div className={`${c}-button-container`}>
                        <Button 
                            className="leaf-button leaf-button-secondary" 
                            onClick={this.handleCancelClick.bind(null)}
                            tabIndex={tabIndex}>
                            Cancel
                        </Button>
                        <Button 
                            className="leaf-button leaf-button-primary" 
                            onClick={this.saveCurrentQuery}
                            style={{ float: 'right' }} 
                            tabIndex={tabIndex}>
                            Save
                        </Button>
                        {/*currentQuery.id && 
                        <Button 
                            className="leaf-button leaf-button-secondary" 
                            style={{ float: 'right' }} 
                            tabIndex={tabIndex}>
                            Save As
                        </Button>*/}
                    </div>
                </div>
            </RightPaneSlider>
        );
    }

    private saveCurrentQuery = () => {
        const { dispatch, queries } = this.props;
        let error = false;

        if (!queries.current.category) { this.setState({ categoryError: true}); error = true; };
        if (!queries.current.name) { this.setState({ nameError: true}); error = true; };

        if (!error) {
            dispatch(requestQuerySave());
        }
    }

    private toggle = () => {
        const { queries, dispatch, show } = this.props;

        // Ignore toggle if pane is closed
        if (!show) { return; }
        let query: Query = { name: '', category: '', description: '' };

        // If query is saved, set current query context to whatever is saved
        if (queries.current.id) {
            query = queries.saved.get((queries.current as SavedQuery).universalId)!;
        }
        dispatch(setCurrentQuery(query));
        dispatch(setRunAfterSave(null));
        dispatch(toggleSaveQueryPane());
        this.setState({ nameError: false, categoryError: false });
    }

    private handleQueryNameChange = (e: any) => {
        const { queries, dispatch } = this.props;
        const name: string = e.currentTarget.value;
        const query: Query = { ...queries.current, name };
        dispatch(setCurrentQuery(query));
        this.setState({ nameError: !name });
    }

    private handleQueryCategoryChange = (e: any) => {
        const { queries, dispatch } = this.props;
        const category: string = e.currentTarget.value;
        const query: Query = { ...queries.current, category };
        dispatch(setCurrentQuery(query));
        this.setState({ categoryError: !category });
    }

    private handleQueryDescriptionChange = (e: any) => {
        const { queries, dispatch } = this.props;
        const description: string = e.currentTarget.value;
        const query: Query = { ...queries.current, description };
        dispatch(setCurrentQuery(query));
    }

    private handleCancelClick = () => this.toggle();

    private handleKeydown = (k: React.KeyboardEvent<HTMLInputElement>) => {

        /*
         * Attempt to save the current query if 'Enter'.
         */
        if (k.key === 'Enter') {
            this.saveCurrentQuery();
        /*
         * If 'Tab', jump between focus on 'Name' and 'Category'.
         */
        } else if (k.key === 'Tab') {
            k.preventDefault();
            const nameClass = `${this.className}-name`;
            const catClass = `${this.className}-category`;
            const tabTo = k.currentTarget.id === nameClass ? catClass : nameClass;
            this.trySetFocus(tabTo);
        }
    }

    private trySetFocus = (id: string) => {
        const input: any = document.getElementById(id);
        if (input && input.focus) {
            input.focus();
        }
    }
}

const mapStateToProps = (state: AppState): StateProps => {
    return {
        queries: state.queries,
        show: state.generalUi.showSaveQueryPane
    };
};

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => {
    return {
        dispatch
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(SaveQueryPanel);
