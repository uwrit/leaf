/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

const caps = /([A-Z])/g;
const firstToUpper = /^./;
const camelCaseToUpperSpaced = (colName: string) => colName.replace(caps, ' $1').replace(firstToUpper, (col: string) => col.toUpperCase());

export default camelCaseToUpperSpaced;