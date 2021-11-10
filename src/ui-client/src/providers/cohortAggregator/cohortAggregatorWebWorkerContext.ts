/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

export const workerContext = `
var handleWorkMessage = function (payload) {
    switch (payload.message) {
        case AGGREGATE_STATISTICS:
            return aggregateStatistics(payload);
        default:
            return null;
    }
};
var aggregateStatistics = function (payload) {
    var cohorts = payload.cohorts, responders = payload.responders, requestId = payload.requestId;
    var preAgg = [];
    cohorts.forEach(function (c) {
        if (responders.get(c.id).enabled && c.visualization && c.visualization.demographics) {
            preAgg.push(c.visualization.demographics);
        }
    });
    var aggregate = preAgg.reduce(function (prev, curr) {
        // For all age by gender buckets (eg, 35-44, 45-54, 55-64)
        Object.keys(prev.ageByGenderData.buckets).forEach(function (k) {
            var prevBucket = prev.ageByGenderData.buckets[k];
            var currBucket = curr.ageByGenderData.buckets[k];
            // For all gender identifications, sum
            Object.keys(prevBucket).forEach(function (gk) {
                prevBucket[gk] += currBucket[gk];
            });
        });
        // Binary splits are in arrays which should always be in the same order, but
        // match up by category strings to be safe
        prev.binarySplitData.forEach(function (v) {
            var t = curr.binarySplitData.find(function (x) { return x.category === v.category; });
            if (t) {
                v.left.value += t.left.value;
                v.right.value += t.right.value;
            }
        });
        // Language by heritage
        Object.keys(curr.languageByHeritageData.data.buckets).forEach(function (k) {
            var currBucket = curr.languageByHeritageData.data.buckets[k];
            var prevBucket = prev.languageByHeritageData.data.buckets[k];
            if (!prevBucket) {
                prevBucket = Object.assign({}, currBucket);
                prev.languageByHeritageData.data.buckets[k] = prevBucket;
            }
            else {
                Object.keys(currBucket.subBuckets).forEach(function (sbk) {
                    if (prevBucket.subBuckets[sbk]) {
                        prevBucket.subBuckets[sbk] += currBucket.subBuckets[sbk];
                    }
                });
            }
        });
        // Religion
        Object.keys(curr.religionData).forEach(function (k) {
            var currBucket = curr.religionData[k];
            var prevBucket = prev.religionData[k];
            if (!prevBucket) {
                prevBucket = Object.assign({}, currBucket);
                prev.religionData[k] = prevBucket;
            }
            else {
                Object.keys(currBucket).forEach(function (sbk) {
                    if (!prevBucket[sbk]) {
                        prevBucket[sbk] = 0;
                    }
                    prevBucket[sbk] += currBucket[sbk];
                });
            }
        });
        // NIH Race, Ethnicity, Gender
        Object.keys(curr.nihRaceEthnicityData).forEach(function (k) {
            var currBucket = curr.nihRaceEthnicityData[k];
            var prevBucket = prev.nihRaceEthnicityData[k];
            if (!prevBucket) {
                prevBucket = Object.assign({}, currBucket);
                prev.nihRaceEthnicityData[k] = prevBucket;
            }
            else {
                Object.keys(currBucket).forEach(function (eb) {
                    if (!prevBucket[eb]) {
                        prevBucket[eb] = currBucket[eb];
                    }
                    else {
                        Object.keys(currBucket[eb]).forEach(function (hispType) {
                            Object.keys(currBucket[eb][hispType]).forEach(function (genderType) {
                                prevBucket[eb][hispType][genderType] += currBucket[eb][hispType][genderType];
                            });
                        });
                    }
                });
            }
        });
        return prev;
    });
    return { requestId: requestId, result: aggregate };
};
`