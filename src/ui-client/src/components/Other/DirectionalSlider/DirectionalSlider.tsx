/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { generate as generateId } from 'shortid';
import './DirectionalSlider.css';

interface Props {
    show: boolean;
    from: Direction;
    toggle: () => any;
    overlay?: boolean;
    overlayContent?: JSX.Element;
}

export enum Direction { Right, Left }

export class DirectionalSlider extends React.Component<Props> {
    private className = 'directional-slider';
    private instanceName = '';
    private mouseOut = true;

    public static defaultProps = {
        overlay: true
    }

    public handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
        if (this.mouseOut) {
            this.props.toggle();
        }
    }

    public componentWillMount() {
        this.instanceName = `${this.className}-${generateId()}`;
    }

    public componentDidUpdate(prevProps: Props, prevState: any) {
        // Set focus to the element body to catch blur events if clicked outside
        if (this.props.show && !prevProps.show) {

            /**
             * Try to focus on input, if present.
             */
            const firstInput = document.querySelector(`#${this.instanceName} input`) as any;
            if (firstInput && firstInput.focus) {
                firstInput.focus();
                return;
            }

            /**
             * Else try to focus on the body itself.
             */
            const el: any = document.getElementsByClassName(`${this.className}-body`);
            if (el && el[0]) {
                 el[0].focus();
            }    
        } 
    }

    public handleMouseEnter = () => this.mouseOut = false;

    public handleMouseLeave = () => this.mouseOut = true;

    public render() {
        const { overlay, overlayContent } = this.props;
        const c = this.className;
        const classes = `${c}-container ${this.props.show ? 'show' : ''} ${this.props.from === Direction.Left ? 'left' : 'right'}`

        return (
            <div className={classes}>
                {overlay && 
                <div className={`${c}-overlay`}>
                    {overlayContent}
                </div>
                }
                <div className={`${c}-body`} id={this.instanceName} 
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