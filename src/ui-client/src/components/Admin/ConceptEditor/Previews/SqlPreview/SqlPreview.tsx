/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { createPortal } from 'react-dom';
import { SqlBox } from '../../../../Other/SqlBox/SqlBox';
import './SqlPreview.css';

interface Props {
    sql: string;
}

interface State {
    width: number;
}

export class SqlPreview extends React.PureComponent<Props, State> {
    private className = 'concept-editor-preview';
    private mounted = false;

    constructor(props: Props) {
        super(props);
        this.state = {
            width: 0
        }
    }

    public componentDidMount() {
        this.mounted = true;
        this.setWidth();
        window.addEventListener('resize', this.setWidth );
    }

    public componentWillUnmount() {
        this.mounted = false;
        window.removeEventListener('resize', () => this.setWidth );
    }

    public render() {
        const { sql } = this.props;
        const c = this.className;
        const width = (document.body.clientWidth * 0.35) - 50;

        return (
            createPortal(
                <div className={`${c}-sql-container concept-editor-preview`}>
                    <div className={`${c}-sql-container-inner`}>
                        <SqlBox height={230} width={width} sql={sql} fontSize={'0.9rem'} readonly={true}/>
                    </div>
                </div>,
                document.body
            )
        );
    }

    private setWidth = () => {
        if (!this.mounted) { return; }
        const width = (document.body.clientWidth * 0.35) - 50;
        this.setState({ width });
    }
};
