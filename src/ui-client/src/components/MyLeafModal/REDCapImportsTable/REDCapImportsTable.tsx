/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import './REDCapImportsTable.css';
import { ImportMetadata } from '../../../models/dataImport/ImportMetadata';

interface Props {
    dispatch: any;
    imports: ImportMetadata[];
}

export default class REDCapImportsTable extends React.PureComponent<Props> {
    public render() {
        const { imports } = this.props;
        return null;
    }

};