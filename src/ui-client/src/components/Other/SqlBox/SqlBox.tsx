/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import AceEditor from 'react-ace'; 
import 'ace-builds/src-noconflict/mode-sqlserver';
import 'ace-builds/src-noconflict/theme-sqlserver';

interface Props {
    changeHandler?: (value:string, evt: any) => void;
    height: number;
    fontSize?: string | number;
    readonly: boolean;
    sql: string;
    width: number;
}

export class SqlBox extends React.PureComponent<Props> {
    public render() {
        const { sql, height, width, fontSize, readonly, changeHandler } = this.props;
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
                    onChange={changeHandler}
                    readOnly={readonly}
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
