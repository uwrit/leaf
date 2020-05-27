/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { createPortal } from 'react-dom';
import './PopupBox.css';

export interface Props {
    forceMouseInOnMount?: boolean;
    parentDomRect?: DOMRect;
    toggle: () => any;
    style?: any;
}

interface State {
    shown: boolean;
}

export default class PopupBox extends React.PureComponent<Props, State> {
    private className = 'popup-box';
    private mouseOut = true;
    constructor(props: Props) {
        super(props);
        this.state = {
            shown: false
        }
    }

    public componentDidMount() {
        this.setPopupBoxFocus();
        setTimeout(() => this.setState({ shown: true }), 10)
    }

    public render() {
        const { parentDomRect, children } = this.props;
        const c = this.className;
        const body = document.body;
        const classes = [ c, (!this.state.shown ? 'appear' : '') ];
        const style = parentDomRect 
            ? { ...this.props.style, bottom: parentDomRect.bottom, left: parentDomRect.left, top: parentDomRect.top } 
            : undefined;

        return (
            createPortal(
                <div 
                    className={classes.join(' ')} 
                    onBlur={this.handleBlur} 
                    onMouseLeave={this.handleMouseLeave} 
                    onMouseEnter={this.handleMouseEnter} 
                    ref={this.triggerClick}
                    tabIndex={0}
                    style={style}>
                    <div className={`${c}-inner`}>
                        {children}
                    </div>
                </div>
            , body)
        );
    }

    private handleMouseEnter = () => this.mouseOut = false;

    private handleMouseLeave = () => this.mouseOut = true;

    private handleBlur = (e: React.SyntheticEvent<Element>) => {
        if (this.mouseOut) { this.props.toggle(); }
    }

    private triggerClick = (el: any) => {
        if (el) { el.click(); }
    }

    private setPopupBoxFocus = () => {
        const popupBoxElem: any = document.getElementsByClassName(this.className);
        if (popupBoxElem[0] && popupBoxElem[0].focus) {
            if (this.props.forceMouseInOnMount) {
                this.mouseOut = false;
            }
            popupBoxElem[0].focus();
        }
    }
}