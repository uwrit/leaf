/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

// Adapted from https://stackoverflow.com/questions/12489546/how-to-get-browsers-name-client-side
import { Browser, BrowserType } from "../models/state/GeneralUiState";

export const getBrowser = (): Browser => {
    const nAgt = navigator.userAgent;
    let browserName  =BrowserType.Other;
    let fullVersion  = ''+parseFloat(navigator.appVersion); 
    let majorVersion = parseInt(navigator.appVersion,10);
    let verOffset: any;
    let ix: any;

    // In Opera, the true version is after "Opera" or after "Version"
    if ((verOffset=nAgt.indexOf("Opera"))!==-1) {
        browserName = BrowserType.Opera;
        fullVersion = nAgt.substring(verOffset+6);
        if ((verOffset=nAgt.indexOf("Version"))!==-1) 
            fullVersion = nAgt.substring(verOffset+8);
    }
    // In MSIE, the true version is after "MSIE" in userAgent
    else if ((verOffset=nAgt.indexOf("MSIE"))!==-1) {
        browserName = BrowserType.InternetExplorer;
        fullVersion = nAgt.substring(verOffset+5);
    }
    // In Chrome, the true version is after "Chrome" 
    else if ((verOffset=nAgt.indexOf("Chrome"))!==-1) {
        browserName = /Edge/.test(nAgt) ? BrowserType.Edge : BrowserType.Chrome;
        fullVersion = nAgt.substring(verOffset+7);
    }
    // In Safari, the true version is after "Safari" or after "Version" 
    else if ((verOffset=nAgt.indexOf("Safari"))!==-1) {
        browserName = BrowserType.Safari;
        fullVersion = nAgt.substring(verOffset+7);
        if ((verOffset=nAgt.indexOf("Version"))!==-1) 
            fullVersion = nAgt.substring(verOffset+8);
        }
    // In Firefox, the true version is after "Firefox" 
    else if ((verOffset=nAgt.indexOf("Firefox"))!==-1) {
        browserName = BrowserType.Firefox;
        fullVersion = nAgt.substring(verOffset+8);
    }
    /*
    // In most other browsers, "name/version" is at the end of userAgent 
    else if ( (nameOffset=nAgt.lastIndexOf(' ')+1) < (verOffset=nAgt.lastIndexOf('/')) ) {
        browserName = nAgt.substring(nameOffset,verOffset);
        fullVersion = nAgt.substring(verOffset+1);
        if (browserName.toLowerCase()==browserName.toUpperCase()) {
            browserName = navigator.appName;
        }
    }
    */
    // trim the fullVersion string at semicolon/space if present
    if ((ix=fullVersion.indexOf(";"))!==-1)
        fullVersion=fullVersion.substring(0,ix);
    if ((ix=fullVersion.indexOf(" "))!==-1)
        fullVersion=fullVersion.substring(0,ix);

    majorVersion = parseInt(''+fullVersion,10);
    if (isNaN(majorVersion)) {
        fullVersion  = ''+parseFloat(navigator.appVersion); 
        majorVersion = parseInt(navigator.appVersion,10);
    }

    return {
        error: !(
            (browserName === BrowserType.Chrome && majorVersion >= 72) ||
            (browserName === BrowserType.Firefox && majorVersion >= 65) ||
            (browserName === BrowserType.Edge && majorVersion >= 44) ||
            (browserName === BrowserType.Safari && majorVersion >= 12)
        ),
        type: browserName,
        majorVersion,
        version: fullVersion
    };
};