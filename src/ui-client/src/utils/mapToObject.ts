/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

export const objectToMapRecursive = (input: any) => {
    const ob = input.constructor.name === "Map" || input.constructor.name === "Set"
        ? demap(input)
        : Object.assign({}, input);
    const keys = Object.keys(ob);
    for (const key of keys) {
        let val = ob[key];
        if (!val) { break; }
        switch (val.constructor.name) {
            case "Map": 
            case "Set":
                ob[key] = demap(val);
                break;
            case "Object":
                ob[key] = objectToMapRecursive(val)
            default:
                break;
        } 
    }
    return ob;
};

const demap = (map: Map<any, any>) => {
    const output: any = { };
    map.forEach((v, k) => {
        output[k] = v.constructor.name === "Map" || v.constructor.name === "Set"
            ? demap(v)
            : Object.assign({}, v);
    });
    return output;
};

export const mapToObject = (input: any, targetShape: Object) => {
    const output = {};
    const keys = Object.keys(input);
    for (const key of keys) {
        const target = targetShape[key]
        let val = input[key];
        if (target && (target.constructor.name === "Map" || target.constructor.name === "Set")) {
            val = mapToObject(val, target);
        }
        output[key] = val;
    }
    return output;
};