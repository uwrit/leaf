/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';

interface Props {
    header: string;
}

export class Section extends React.PureComponent<Props> {
    private className = "admin-panel"

    public render() {
        const { children, header } = this.props;
        const c = this.className;
        return (
            <div className={`${c}-section`}>
                <div className={`${c}-section-header`}>{header}</div>
                <div className={`${c}-section-body`}>
                    {children}
                </div>
            </div>
        );
    }
};
