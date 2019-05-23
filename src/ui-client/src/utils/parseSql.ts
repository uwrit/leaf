/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

const SELECT_FROM_SPLITTER = /\SELECT([\s\S]*?)\FROM/i;
const BRACKETS = /(\[|\])/g;
const EQUALS = '=';
const AS = 'AS';
const COMMA = ',';
const SPACE = ' ';
const PERIOD = '.';
const EMPTY = '';
const LEFT_PAREN = '(';
const LEFT_PAREN_REGEX = /\(/g;
const LEFT_PAREN_SPACED = ' ( ';
const RIGHT_PAREN = ')';
const RIGHT_PAREN_REGEX = /\)/g;
const RIGHT_PAREN_SPACED = ' ) ';

export const getSqlColumns = (input: string) => {
    const split = removeParens(input).split(SELECT_FROM_SPLITTER);
    const columns: string[] = [];

    if (split.length >= 3) {
        const cols = split[1].replace(BRACKETS, EMPTY).split(COMMA);

        for (const col of cols) {
            if (!col) { continue; }
            const tokens = col.trim().split(SPACE);
            const len = tokens.length;

            /*
             * If only one token (e.g., [column] or x.[column]),
             * split by period to check if it is aliased.
             */
            if (len === 1) {
                const aliased = tokens[0].split(PERIOD);

                /*
                 * If unaliased (e.g., [column]), just use
                 * the sole token returned.
                 */
                if (aliased.length === 1) {
                    columns.push(tokens[0]);

                /*
                 * Else if aliased, use the second token, as the
                 * first is likely the SQL set's alias.
                 */
                } else if (aliased.length === 2) {
                    columns.push(aliased[1]);
                }
            
            /*
             * Else if there are at least 2 tokens.
             */
            } else if (len >= 2) {

                /*
                 * If the second token is '=', use the first token.
                 */
                if (tokens[1] === EQUALS) {
                    columns.push(tokens[0]);
                    continue;
                }
                
                /*
                 * Else if the second-to-last token is 'AS',
                 * use the last token.
                 */
                else if (tokens[len-2].toUpperCase() === AS) {
                    columns.push(tokens[len-1]);
                }
            }
        }
    }
    return columns;
};

/*
 * Removes any parenthesis pairs and substrings
 * contained between them - i.e., 'DATEADD(DAY, 1, MyDate)' => 'DATEADD'.
 * This makes the comma split() in getSqlColumns() more predicatable and prevents
 * functions with commas being falsely identified as return columns.
 */
const removeParens = (input: string): string => {
    const tokens = input
        .trim()
        .replace(LEFT_PAREN_REGEX, LEFT_PAREN_SPACED)
        .replace(RIGHT_PAREN_REGEX, RIGHT_PAREN_SPACED)
        .split(SPACE);
    const outside: string[] = [];
    let parenCnt = 0;

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (!token) { continue; }

        if (token === LEFT_PAREN) {
            parenCnt++;
        } else if (token === RIGHT_PAREN && parenCnt > 0) {
            parenCnt--;
        } else if (parenCnt === 0) {
            outside.push(token);
        }
    }
    return outside.join(SPACE);
};