/* Copyright (c) 2019, UW Medicine Research IT
 * Developed by Nic Dobbins and Cliff Spital
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import AceEditor from 'react-ace'; 
import 'brace/mode/sqlserver';
import 'brace/theme/sqlserver';

interface Props {
    height: number;
    fontSize?: string | number;
    sql: string;
    width: number;
}

export class SqlBox extends React.PureComponent<Props> {
    public render() {
        const { sql, height, width, fontSize } = this.props;
        const c = 'sql-box';
        
        return (
            <div className={c}>
                <AceEditor
                    className={c}
                    editorProps={{ $blockScrolling: Infinity }}
                    highlightActiveLine={false}
                    height={`${height}px`}
                    width={`${width}px`}
                    mode="sqlserver"
                    theme="sqlserver"
                    readOnly={true}
                    showPrintMargin={false}
                    value={sql}
                    setOptions={{
                        fontSize,
                        showGutter: false,
                        showLineNumbers: false,
                        tabSize: 2,
                    }}
                />
            </div>
        );
    }
};
