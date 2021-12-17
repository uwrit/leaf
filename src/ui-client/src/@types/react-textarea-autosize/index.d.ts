/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

declare module "react-textarea-autosize" {

    import React from 'react';

    export interface Props  {
        className?: string;
        defaultValue?: string;
        inputRef?: any;
        maxRows?: number;
        minRows?: number;
        onHeightChange?: any;
        onBlur?: any;
        onChange?: any;
        onClick?: any;
        onFocus?: any;
        onKeyDown?: any;
        placeholder?: string;
        readOnly?: boolean;
        rows?: number;
        spellCheck?: boolean;
        value?: string | number;
        useCacheForDOMMeasurements?: boolean;
    }

    export default class TextareaAutosize extends React.Component<Props> { }
}