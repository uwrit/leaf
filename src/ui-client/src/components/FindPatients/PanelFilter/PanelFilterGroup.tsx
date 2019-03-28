/* Copyright (c) 2019, UW Medicine Research IT
 * Developed by Nic Dobbins and Cliff Spital
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { togglePanelFilter } from '../../../actions/panelFilter';
import { PanelFilter as PanelFilterModel } from '../../../models/panel/PanelFilter';
import CheckboxSlider from '../../Other/CheckboxSlider/CheckboxSlider';
import PopupBox from '../../Other/PopupBox/PopupBox';

import './PanelFilterGroup.css';

interface Props {
    dispatch: any;
    filters: PanelFilterModel[];
}

interface State {
    DOMRect?: DOMRect;
    shouldShowFilterSelectionBox: boolean;
}

const className = 'panel-filter';
const mouseOutBubbleUpMillisecondThreshold = 150;
let lastMouseOutClickTime: number = 0;

export default class PanelFilter extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            shouldShowFilterSelectionBox: false
        }
    }

    public handleToggleClick = (e: any) => {
        const timeSinceMouseOutClicked = (new Date().getTime() - lastMouseOutClickTime);
        if (e.currentTarget === e.target && timeSinceMouseOutClicked > mouseOutBubbleUpMillisecondThreshold) {
            const domRect: DOMRect = e.target.getBoundingClientRect();
            this.setState({ DOMRect: domRect, shouldShowFilterSelectionBox: !this.state.shouldShowFilterSelectionBox });
        }
    }

    public render() {
        
        return (
            <div className={`${className}-container`}>
                <span 
                    className={`${className}-toggle`}
                    onClick={this.handleToggleClick}>
                        Limit to
                    {this.state.shouldShowFilterSelectionBox &&
                    <PopupBox
                        parentDomRect={this.state.DOMRect!}
                        toggle={this.handleFilterSelectionBoxClose}>
                        <div className={`${className}-selection-box`}>
                            <div className={`${className}-selection-title`}>Limited to</div>
                            <div className={`${className}-selection-body`}>
                                {this.props.filters.map((f: PanelFilterModel, i: number) => {
                                return (
                                    <div key={i}>
                                        <div className={`${className}-selection-row`}>
                                            <div className={`${className}-selection-row-title`}>{f.uiDisplayText}</div>
                                            <CheckboxSlider checked={f.isActive} onClick={this.handleSelectionBoxItemClick.bind(null, f)} />
                                        </div>
                                        <div className={`${className}-selection-row-description-container`}>
                                            <p className={`${className}-selection-row-description`}>{f.uiDisplayDescription}</p>
                                        </div>
                                    </div>
                                )})}
                            </div>
                        </div>
                    </PopupBox>
                    }
                </span>
                {this.props.filters
                    .filter((f: PanelFilterModel) => f.isActive)
                    .map((f: PanelFilterModel, i: number) => (
                    <span 
                        className={`${className}-item`}
                        key={i} 
                        onClick={this.handlePanelFilterItemClick.bind(null, f)}>
                        {f.uiDisplayText}
                    </span>
                ))}
            </div>
        );
    }

    private handleFilterSelectionBoxClose = () => {
        lastMouseOutClickTime = new Date().getTime();
        this.setState({ shouldShowFilterSelectionBox: false });
    }

    private handlePanelFilterItemClick = (filter: PanelFilterModel) => {
        this.props.dispatch(togglePanelFilter(filter, false));
    }

    private handleSelectionBoxItemClick = (filter: PanelFilterModel) => {
        this.props.dispatch(togglePanelFilter(filter, !filter.isActive));
    }
}