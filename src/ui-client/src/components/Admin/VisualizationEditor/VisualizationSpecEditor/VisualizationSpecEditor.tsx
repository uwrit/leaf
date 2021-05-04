/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { AdminVisualizationComponent, AdminVisualizationPage } from '../../../../models/admin/Visualization';
import AceEditor from 'react-ace'; 
import 'brace/mode/json';

interface Props { 
    currentPage?: AdminVisualizationPage;
    currentComponent?: AdminVisualizationComponent;
    dispatch: any;
}

export default class VisualizationSpecEditor extends React.PureComponent<Props> {
    private className = 'visualization-spec-editor';

    public render() {
        const c = this.className;
        const { currentPage, currentComponent } = this.props;

        if (!currentPage || !currentComponent) return null;

        return (
            <div className={c}>
                <AceEditor
                    className={c}
                    editorProps={{ $blockScrolling: Infinity }}
                    highlightActiveLine={false}
                    height={`${500}px`}
                    width={`${500}px`}
                    mode="json"
                    showPrintMargin={false}
                    value={currentComponent.jsonSpec}
                    setOptions={{
                        fontSize: 12,
                        showGutter: false,
                        showLineNumbers: false,
                        tabSize: 2,
                    }}
                />
            </div>
        );
    }
}