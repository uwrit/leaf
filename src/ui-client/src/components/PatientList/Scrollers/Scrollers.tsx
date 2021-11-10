/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { createPortal } from 'react-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './Scrollers.css';

interface Props {
    displayedColumnsLength?: number;
}

interface State {
    scrollLeft: number;
}

export default class Scrollers extends React.PureComponent<Props, State> {
    private className = 'patientlist-scroller';
    private containerSelector = '.patientlist-table-container';
    private container: any;
    private increment = 300;

    public constructor(props: Props) {
        super(props);
        this.state = {
            scrollLeft: 0
        }
    }

    public componentDidMount() {
        setTimeout(() => { this.setContainer(); this.setScroll() }, 500);
    }

    public getSnapshotBeforeUpdate(prevProps: Props): any {
        this.setContainer();    
        return null; 
    }

    public componentDidUpdate(): any { return null; }

    public render() {
        const canScroll = this.canScroll();
        const c = this.className;

        if (!canScroll) { return null; }

        const canScrollLeft = this.canScrollLeft();
        const canScrollRight = this.canScrollRight();
        const scrollers = [];

        if (canScrollLeft) {
            scrollers.push(createPortal(<div className={`${c} ${c}-left`} onClick={this.handleScrollClick.bind(null, -this.increment)}><FiChevronLeft/></div>, document.body));
        }
        if (canScrollRight) {
            scrollers.push(createPortal(<div className={`${c} ${c}-right`} onClick={this.handleScrollClick.bind(null, this.increment)}><FiChevronRight/></div>, document.body));
        }
        
        return scrollers;
    }

    private setContainer() {
        this.container = document.querySelector(this.containerSelector);
        this.setScroll();
    }

    private setScroll() {
        if (this.container) {
            this.setState({ scrollLeft: this.container.scrollLeft });
        }
    }

    private canScroll = (): boolean => {
        if (!this.container) { return false; }
        return this.container.clientWidth !== this.container.scrollWidth;
    }

    private canScrollLeft = (): boolean => {
        return this.container.scrollLeft > 0;
    }

    private canScrollRight = (): boolean => {
        return (this.container.clientWidth + this.container.scrollLeft) < this.container.scrollWidth;
    }

    private handleScrollClick = (incr: number) => {
        this.container.scroll({ left: (this.state.scrollLeft + incr), behavior: 'smooth' });
        setTimeout(() => this.setScroll(), 500);
    }
}   
