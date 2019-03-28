/* Copyright (c) 2019, UW Medicine Research IT
 * Developed by Nic Dobbins and Cliff Spital
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
        onFocus?: any;
        readOnly?: boolean;
        rows?: number;
        spellCheck?: boolean;
        value?: string | number;
        useCacheForDOMMeasurements?: boolean;
    }

    export default class TextareaAutosize extends React.Component<Props> { }
}