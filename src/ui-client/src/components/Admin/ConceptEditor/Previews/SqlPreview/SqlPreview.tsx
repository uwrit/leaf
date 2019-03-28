/* Copyright (c) 2019, UW Medicine Research IT
 * Developed by Nic Dobbins and Cliff Spital
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

export class SqlPreview extends React.PureComponent<Props> {
    private className = 'concept-editor-preview';
    public render() {
        const { sql } = this.props;
        const c = this.className;
        const width = (document.body.clientWidth * 0.25) - 50;

        return (
            createPortal(
                <div className={`${c}-sql-container concept-editor-preview`}>
                    <div className={`${c}-sql-container-inner`}>
                        <SqlBox height={230} width={width} sql={sql} fontSize={'0.9rem'} />
                    </div>
                </div>,
                document.body
            )
        );
    }
};
