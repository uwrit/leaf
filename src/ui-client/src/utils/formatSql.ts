/* Copyright (c) 2019, UW Medicine Research IT
 * Developed by Nic Dobbins and Cliff Spital
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import sqlFormatter from 'sql-formatter';

const formatSql = (rawSql: string) => {
    return sqlFormatter.format(rawSql, { indent: '    '});
}

const formatMultipleSql = (rawSql: string[]) => {
    return rawSql
        .map((s: string) => formatSql(s))
        .join('/n /n ****** /n /n');
}

export default formatSql;
export { formatMultipleSql };