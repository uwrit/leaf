/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
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
    var aggregate = preAgg.reduce(function (agg, target) {
        // For all age by gender buckets (eg, 35-44, 45-54, 55-64)
        Object.keys(agg.ageByGenderData.buckets).forEach(function (bucketKey) {
            var aggBucket = agg.ageByGenderData.buckets[bucketKey];
            var targetBucket = target.ageByGenderData.buckets[bucketKey];
            // For all gender identifications, sum
            Object.keys(aggBucket).forEach(function (genderKey) {
                aggBucket[genderKey] += targetBucket[genderKey];
            });
        });
        // Binary splits are in arrays which should always be in the same order, but
        // match up by category strings to be safe
        agg.binarySplitData.forEach(function (v) {
            var t = target.binarySplitData.find(function (x) { return x.category === v.category; });
            if (t) {
                v.left.value += t.left.value;
                v.right.value += t.right.value;
            }
        });
        return agg;
    });
    return { requestId: requestId, result: aggregate };
};`