import SQLParser from 'sql-parser';

const LITERAL = 'LITERAL';
const EQUALS = '=';
const AS = 'AS';
const SEPARATOR = 'SEPARATOR';

export const getSqlColumns = (sql: string) => {
    const reg = /(\[|\])/g;
    const cleaned = sql.replace(reg,'');
    const cols: string[] = [];
    
    try {
        const output = SQLParser.lexer.tokenize(cleaned);
        
        if (output) {
            const last = output.length - 1;
            for (let i = 1; i < last; i++) {
                const t0: string[] = output[i];
                if (t0[0] === LITERAL) {
                    const t1: string[] = output[i+1];
                    const t_1: string[] = output[i-1];
                    if (t1[0] === EQUALS || t1[0] === SEPARATOR || t_1[0] === AS) {
                        cols.push(t0[1]);
                    }
                }
            }
            return cols;
        }
    } catch {}
    return null;
};