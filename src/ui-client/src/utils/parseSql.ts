const SELECT_FROM_SPLITTER = /\SELECT([\s\S]*?)\FROM/;
const PARENS = /(\(|\))/;
const BRACKETS = /(\[|\])/g;
const ALPHABET = /[a-z]/i;
const EQUALS = '=';
const AS = 'AS';
const COMMA = ',';
const SPACE = ' ';
const PERIOD = '.';
const EMPTY = '';

export const getSqlColumns = (input: string) => {
    const split = input.split(SELECT_FROM_SPLITTER);
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
                if (aliased.length === 1 && ALPHABET.test(tokens[0])) {
                    columns.push(tokens[0]);

                /*
                 * Else if aliased, use the second token, as the
                 * first is like the SQL set's alias.
                 */
                } else if (aliased.length === 2) {
                    columns.push(aliased[1]);
                }
            
            /*
             * Else if there are at least 3 tokens.
             */
            } else if (len >= 3) {

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
                const t_02 = tokens[len-2].toUpperCase();
                const t_01 = tokens[len-1];
                if (t_02 === AS && !PARENS.test(t_02) && !PARENS.test(t_01)) {
                    columns.push(t_01);
                }
            }
        }
    }
    return columns;
};