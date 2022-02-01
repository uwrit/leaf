/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Button, Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Input } from 'reactstrap';
import { getAdminHelpPageContent, updateAdminHelpCategoryMap, updateAdminHelpPagesAndCategory } from '../../../../actions/admin/helpPage';
import { AdminHelpPageCategory, AdminHelpCategoryMap, AdminHelpCategoryPageCache, PartialAdminHelpPage } from '../../../../models/admin/Help';
import './Pages.css';

interface Props {
    categoryMap: AdminHelpCategoryMap;
    currentCategory: AdminHelpCategoryPageCache;
    tempPartialHelpPage: PartialAdminHelpPage;
    dispatch: any;
}

interface State {
    catUnsaved: boolean;
    inputCategory: string;
    showAllPages: boolean;
}

export class Pages extends React.Component<Props, State> {
    private className = "admin-pages"

    constructor(props: Props) {
        super(props);
        this.state = {
            catUnsaved: false,
            inputCategory: '',
            showAllPages: false
        };
    };

    public render() {
        const c = this.className;
        const { currentCategory, categoryMap, tempPartialHelpPage } = this.props;
        const { inputCategory, showAllPages, catUnsaved } = this.state;

        const partialPages = currentCategory.partialPages;
        const numberOfPages = partialPages.length;
        const numberOfPagesGreaterThanFive = (numberOfPages > 5) ? true : false;
        const start = 0;
        const defaultEnd = 5; // Maximum of 5 help pages will show by default.
        const end = showAllPages ? numberOfPages : defaultEnd;
        const slicedPartialPages = partialPages.slice(start, end);
        const categories = [ ...categoryMap.values() ];
        // Filter out current category so it doesn't appear as an option in category dropdown.
        const newCatsList = categories.filter(c => c.id !== currentCategory.id);

        return (
            <Col className={c} xs="4">
                <div className={`${c}-category`}>
                    <Dropdown isOpen={catUnsaved} toggle={this.handleSaveCat}>
                        <DropdownToggle caret>
                            {currentCategory.name.toUpperCase()}
                        </DropdownToggle>
                        <DropdownMenu>
                            <div>
                                <Input value={inputCategory} placeholder='New Category' onChange={this.handleCategoryChange.bind(null, currentCategory)}/>
                            </div>

                            {newCatsList.map((c, i) => 
                                <DropdownItem key={i} onClick={this.handleCategoryClick.bind(null, c, currentCategory)}>{c.name}</DropdownItem>
                            )}
                        </DropdownMenu>
                    </Dropdown>
                </div>

                {currentCategory.id === tempPartialHelpPage.categoryId && <div style={{color: "#FF0000"}}>{tempPartialHelpPage.title}</div>}

                {slicedPartialPages.map(p =>
                    <div key={p.id} className={`${c}-page`}>
                        <Button color="link" onClick={this.handleHelpPageTitleClick.bind(null, p)}>
                            {p.title}
                        </Button>
                    </div>
                )}

                <div className={`${c}-show-all`}>
                    <Button color="link" onClick={this.handleSeeAllPagesClick}>
                        {numberOfPagesGreaterThanFive &&
                            (showAllPages
                                ? <span>Less ...</span>
                                : <span>See all {numberOfPages} pages</span>
                            )
                        }
                    </Button>
                </div>
            </Col>
        );
    };

    private handleSaveCat = () => {
        const { currentCategory, dispatch } = this.props;

        this.setState(function (prevState) {
            const newCat = { id: '', name: prevState.inputCategory } as AdminHelpPageCategory;
            if (prevState.catUnsaved && prevState.inputCategory) {
                dispatch(updateAdminHelpPagesAndCategory(currentCategory.id, newCat));
            };
            return { catUnsaved: !prevState.catUnsaved, inputCategory: '' };
        });
    };

    private handleCategoryChange = (currentCat: AdminHelpCategoryPageCache, e: React.ChangeEvent<HTMLInputElement>) => {
        const { categoryMap, dispatch } = this.props;
        const val = e.currentTarget.value;
        const updatedInputCatPageCache = Object.assign({}, currentCat, { name: val }) as AdminHelpCategoryPageCache;
        
        this.setState({ inputCategory: val });
        categoryMap.set(currentCat.id, updatedInputCatPageCache);
        dispatch(updateAdminHelpCategoryMap(categoryMap));
    };

    private handleCategoryClick = (clickedCat: AdminHelpCategoryPageCache, currentCat: AdminHelpCategoryPageCache) => {
        const { dispatch } = this.props;
        const newCat = { id: clickedCat.id, name: clickedCat.name } as AdminHelpPageCategory;
        dispatch(updateAdminHelpPagesAndCategory(currentCat.id, newCat));
    };

    // // // // //
    private handleSeeAllPagesClick = () => {
        this.setState(prevState => ({ showAllPages: !prevState.showAllPages }));
    };

    private handleHelpPageTitleClick = (page: PartialAdminHelpPage) => {
        const { currentCategory, dispatch } = this.props;
        dispatch(getAdminHelpPageContent(page, currentCategory));
    };
};