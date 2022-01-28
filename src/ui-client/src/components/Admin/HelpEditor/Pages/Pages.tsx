/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Button, Col } from 'reactstrap';
import { getAdminHelpPageContent } from '../../../../actions/admin/helpPage';
import { AdminHelpCategoryPageCache, PartialAdminHelpPage } from '../../../../models/admin/Help';
import './Pages.css';

import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Input } from 'reactstrap';

interface Props {
    category: AdminHelpCategoryPageCache;
    tempHelpPage: PartialAdminHelpPage;
    dispatch: any;

    categories: AdminHelpCategoryPageCache[];
}

interface State {
    inputCategory: string;
    showAllPages: boolean;
    showCats: boolean;
}

export class Pages extends React.Component<Props, State> {
    private className = "admin-pages"

    constructor(props: Props) {
        super(props);   
        this.state = {
            inputCategory: '',
            showAllPages: false,
            showCats: false
        }
    };

    public render() {
        const c = this.className;
        const { category, categories, tempHelpPage } = this.props;
        const { inputCategory, showAllPages, showCats } = this.state;

        const pages = category.pages;
        const numberOfPages = pages.length;
        const numberOfPagesGreaterThanFive = (numberOfPages > 5) ? true : false;
        const start = 0;
        const defaultEnd = 5; // Maximum of 5 help pages will show by default.
        const end = showAllPages ? numberOfPages : defaultEnd;
        const slicedPages = pages.slice(start, end);

        // Filter out current category so it doesn't appear as an option in category dropdown.
        const newCatsList = categories.filter(c => c.id !== category.id);

        return (
            <Col className={c} xs="4">
                <div className={`${c}-category`}>
                    <b>{category.name.toUpperCase()}</b>

                    {/*  */}
                    <Dropdown isOpen={showCats} toggle={this.handleShowCats}>
                        <DropdownToggle caret>
                            {category.name}
                        </DropdownToggle>
                        <DropdownMenu>
                            <div>
                                <Input value={inputCategory} placeholder='New Category' onChange={this.handleCategoryChange} />
                            </div>

                            {newCatsList.map((c, i) => 
                                <DropdownItem key={i}>{c.name}</DropdownItem>
                            )}
                        </DropdownMenu>
                    </Dropdown>
                    {/*  */}
                </div>

                {category.id === tempHelpPage.categoryId && <div style={{color: "#FF0000"}}>{tempHelpPage.title}</div>}

                {slicedPages.map(p =>
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

    private handleShowCats = () => {
        const { showCats } = this.state;
        this.setState({ inputCategory: '', showCats: !showCats });
    };

    private handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.currentTarget.value;
        this.setState({ inputCategory: val });
    };

    // // // // //
    private handleSeeAllPagesClick = () => { this.setState({ showAllPages: !this.state.showAllPages }) };

    private handleHelpPageTitleClick = (page: PartialAdminHelpPage) => {
        const { dispatch, category } = this.props;
        dispatch(getAdminHelpPageContent(page, category));
    };
};