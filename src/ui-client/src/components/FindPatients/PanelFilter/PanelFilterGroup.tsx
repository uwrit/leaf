/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
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

export default class PanelFilter extends React.PureComponent<Props, State> {
    private className = 'panel-filter';
    private mouseOutBubbleUpMillisecondThreshold = 150;
    private lastMouseOutClickTime: number = 0;

    constructor(props: Props) {
        super(props);
        this.state = {
            shouldShowFilterSelectionBox: false
        }
    }

    public handleToggleClick = (e: any) => {
        const { shouldShowFilterSelectionBox } = this.state;
        const timeSinceMouseOutClicked = (new Date().getTime() - this.lastMouseOutClickTime);

        if (e.currentTarget === e.target && timeSinceMouseOutClicked > this.mouseOutBubbleUpMillisecondThreshold) {
            const domRect: DOMRect = e.target.getBoundingClientRect();
            this.setState({ DOMRect: domRect, shouldShowFilterSelectionBox: !shouldShowFilterSelectionBox });
        }
    }

    public render() {
        const { shouldShowFilterSelectionBox, DOMRect } = this.state;
        const { filters } = this.props;
        const c = this.className;
        
        return (
            <div className={`${c}-container`}>
                <span 
                    className={`${c}-toggle`}
                    onClick={this.handleToggleClick}>
                        Limit to
                    {shouldShowFilterSelectionBox &&
                    <PopupBox
                        parentDomRect={DOMRect!}
                        toggle={this.handleFilterSelectionBoxClose}>
                        <div className={`${c}-selection-box`}>
                            <div className={`${c}-selection-title`}>
                                <p>
                                    Enabling the options below allow you to add criteria to your query without 
                                    dragging more Concepts over. These are just for convenience, and are completely optional.
                                </p>
                            </div>
                            <div className={`${c}-selection-body`}>
                                {filters.length === 0 &&
                                <div className={`${c}-no-filters`}>
                                    It looks like your administrator hasn't added these yet!
                                </div>
                                }
                                {filters.map((f: PanelFilterModel) => {
                                return (
                                    <div key={f.id}>
                                        <div className={`${c}-selection-row`}>
                                            <div className={`${c}-selection-row-title`}>{f.uiDisplayText}</div>
                                            <CheckboxSlider checked={f.isActive} onClick={this.handleSelectionBoxItemClick.bind(null, f)} />
                                        </div>
                                        <div className={`${c}-selection-row-description-container`}>
                                            <p className={`${c}-selection-row-description`}>{f.uiDisplayDescription}</p>
                                        </div>
                                    </div>
                                )})}
                            </div>
                        </div>
                    </PopupBox>
                    }
                </span>
                {filters
                    .filter((f: PanelFilterModel) => f.isActive)
                    .map((f: PanelFilterModel) => (
                    <span 
                        className={`${c}-item`}
                        key={f.id} 
                        onClick={this.handlePanelFilterItemClick.bind(null, f)}>
                        {f.uiDisplayText}
                    </span>
                ))}
            </div>
        );
    }

    private handleFilterSelectionBoxClose = () => {
        this.lastMouseOutClickTime = new Date().getTime();
        this.setState({ shouldShowFilterSelectionBox: false });
    }

    private handlePanelFilterItemClick = (filter: PanelFilterModel) => {
        const { dispatch } = this.props;
        dispatch(togglePanelFilter(filter, false));
    }

    private handleSelectionBoxItemClick = (filter: PanelFilterModel) => {
        const { dispatch } = this.props;
        dispatch(togglePanelFilter(filter, !filter.isActive));
    }
}