/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import PopupBox from '../Other/PopupBox/PopupBox';
import { SiteCountDetail } from './CohortCountSiteDetail';
import { SqlBox } from '../Other/SqlBox/SqlBox';

export interface Props {
    DOMRect?: DOMRect;
    data: SiteCountDetail;
    toggle: () => void;
}

interface State {
    copied: boolean;
}

let isMounted = false;

export default class CohortSql extends React.PureComponent<Props, State> {
    private className = 'cohort-count-site';
    private copyTimeoutMs = 3000;
    constructor(props: Props) {
        super(props);
        this.state = {
            copied: false
        }
    }

    public componentDidMount() {
        isMounted = true;
    }

    public componentWillUnmount() {
        isMounted = false;
    }

    public render() {
        const { toggle, DOMRect } = this.props;
        const c = this.className;
        const d = this.props.data;
        const sql = d.countResults.sqlStatements[0];
        const copyText = this.state.copied ? 'Copied!' : 'Copy to Clipboard';
        const copyClass = `${c}-sql-copy ${this.state.copied ? 'copied' : ''}`;

        // Ace Editor doesn't auto-size based on its container 
        // and tends to fight css, so auto-calculate sizes
        const containerStyle = {
            height: 500,
            marginLeft: 0,
            padding: 10,
            paddingTop: 10,
            width: 800
        };
        containerStyle.marginLeft = -(containerStyle.width / 2);
        const headerStyle = {
            height: 25,
            marginBottom: 10
        };
        const innerStyle = {
            height: (containerStyle.height - (containerStyle.padding * 2) - headerStyle.height - headerStyle.marginBottom),
            width: (containerStyle.width - (containerStyle.padding * 2))
        };

        return (
            <PopupBox parentDomRect={DOMRect!} toggle={toggle}>
                <div className={`${c}-sql-container`} style={containerStyle}>
                    <div className={`${c}-sql-header`} style={headerStyle}>
                        <span className={`${c}-sql-name`}>
                            <span style={{ color: d.id.primaryColor}}>{d.id.name}</span>
                        </span>
                        <span className={`${c}-sql-count`}>
                            <span> - </span>
                            <strong>{d.countResults.value.toLocaleString()}</strong>
                            <span> patients</span>
                        </span>
                        <span className={`${c}-sql-close`} onClick={toggle}>✖</span>
                    </div>
                    <CopyToClipboard 
                        text={sql}>
                        <div className={copyClass} onClick={this.handleCopyClick}>{copyText}</div>
                    </CopyToClipboard>
                    <SqlBox height={innerStyle.height} width={innerStyle.width} sql={sql} readonly={true}/>
                </div>
            </PopupBox>
        );
    }

    private handleCopyClick = () => {
        this.setState({ copied: true });
        setTimeout(() => {
            if (isMounted) {
                this.setState({ copied: false })
            }
        }, this.copyTimeoutMs);
    }
}

