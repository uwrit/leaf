/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import './RightPaneSlider.css';

interface Props {
    show: boolean;
    toggle: () => any;
    overlay?: boolean;
}

export default class RightPaneSlider extends React.Component<Props> {
    private className = 'right-pane-slider';
    private mouseOut = true;

    public static defaultProps = {
        overlay: true
    }

    public handleBlur = () => {
        if (this.mouseOut) {
            this.props.toggle();
        }
    }

    public componentDidUpdate(prevProps: Props, prevState: any) {
        // Set focus to the element body to catch blur events if clicked outside
        if (this.props.show && !prevProps.show) {
            const el: any = document.getElementsByClassName(`${this.className}-body`);
            if (el && el[0]) {
                el[0].focus();
            }    
        } 
    }

    public handleMouseEnter = () => this.mouseOut = false;

    public handleMouseLeave = () => this.mouseOut = true;

    public render() {
        const { overlay } = this.props;
        const c = this.className;
        const classes = `${c}-container ${this.props.show ? 'show' : ''}`

        return (
            <div className={classes}>
                {overlay && 
                <div className={`${c}-overlay`} />
                }
                <div className={`${c}-body`} 
                    onBlur={this.handleBlur}
                    onMouseLeave={this.handleMouseLeave.bind(null)} 
                    onMouseEnter={this.handleMouseEnter.bind(null)}
                    tabIndex={0}>
                    {this.props.children}
                </div>
            </div>
        );
    }
}