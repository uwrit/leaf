/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { createPortal } from 'react-dom';

interface Props { }

interface State {
    backdrop: Element | null;
}

export default class AttestationFooter extends React.PureComponent<Props,State> {
    private className = 'attestation-footer'

    constructor(props: Props) {
        super(props);
        this.state = {
            backdrop: null
        };
    }

    public componentDidMount() {
        this.setBackdrop();
    }

    public componentDidUpdate() {
        this.setBackdrop();
    }

    public render() {
        const c = this.className;
        const { backdrop } = this.state;

        if (!backdrop) { return null; }

        return createPortal(
            <div className={c}>
                <div className={`${c}-text`}>
                    <strong>Planning to publish your results?</strong>
                    <span>Great! Please cite this manuscript to ensure we can continue making Leaf even better:</span>
                </div>
                <div className={`${c}-manuscript`}>
                    <a href='https://academic.oup.com/jamia/article/27/1/109/5583724' target='_'>
                        <span className={`${c}-manuscript-authors`}>
                            Nicholas J Dobbins, Clifford H Spital, Robert A Black, Jason M Morrison, Bas de Veer, Elizabeth Zampino, Robert D Harrington, 
                            Bethene D Britt, Kari A Stephens, Adam B Wilcox, Peter Tarczy-Hornoch, Sean D Mooney.
                        </span>
                        <span className={`${c}-manuscript-title`}>
                            Leaf: an open-source, model-agnostic, data-driven web application for cohort discovery and translational biomedical research.
                        </span>
                        <span className={`${c}-manuscript-publisher`}>
                            Journal of the American Medical Informatics Association, ocz165, https://doi.org/10.1093/jamia/ocz165
                        </span>
                    </a>
                </div>
            </div>, 
            backdrop
        );
    }

    /*
     * Set the backdrop element if loaded, then remove the 'shown'
     * class after update (this provides the CSS opacity transition).
     */
    private setBackdrop = () => {
        if (!this.state.backdrop) {
            const backdrop = document.querySelector('.attestation-modal-wrap .modal');
            this.setState({ backdrop });
        }
    }
}