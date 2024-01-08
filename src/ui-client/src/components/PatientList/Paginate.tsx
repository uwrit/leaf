/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import ReactPaginate from 'react-paginate';
import './Paginate.css';

interface Props {
    className?: string;
    dispatch: any;
    handlePageCountClick: (data: any) => any;
    pageNumber: number;
    pageSize: number;
    totalElements: number;
}

export default class Paginate extends React.PureComponent<Props> {
    public render() {
        const { className, pageNumber, pageSize, totalElements } = this.props;
        const c = className || 'patientlist';
        const pageCount = Math.ceil(totalElements / pageSize);

        return (
            <ReactPaginate 
                previousLabel={<FaChevronLeft/>}
                nextLabel={<FaChevronRight/>}
                breakLabel={<span>...</span>}
                breakClassName={'break'}
                forcePage={pageNumber}
                pageCount={pageCount}
                marginPagesDisplayed={2}
                pageRangeDisplayed={5}
                onPageChange={this.props.handlePageCountClick}
                containerClassName={`${c}-pagination`}
                activeClassName={'active'} 
            />
        );
    }
}