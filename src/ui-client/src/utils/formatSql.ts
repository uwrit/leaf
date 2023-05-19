/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { format } from 'sql-formatter';

const formatMultipleSql = (rawSql: string[]) => {
    return rawSql.map((s: string, i: number) => {
        return format(s, { 
            commaPosition: 'before',
            expressionWidth: 10000,
            indentStyle: 'tabularLeft',
            language: 'tsql'
        });
    }).join('\n\n\n');
}

const formatSql = (rawSql: string) => {
    return format(rawSql, { 
            commaPosition: 'before',
            expressionWidth: 10000,
            indentStyle: 'tabularLeft',
            language: 'tsql'
    });
}

export default formatSql;
export { formatMultipleSql };