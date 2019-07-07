/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

export const workerContext = `
var patientMap = new Map();
var singletonDatasets = new Map();
var multirowDatasets = new Map();
var defaultPatientOrder = [];
var currentPatientOrder = [];
var currentSortType = 0;
var currentSortColumn = '';
var handleWorkMessage = function (payload) {
    switch (payload.message) {
        case ADD_DEMOGRAPHICS:
            return addPatientRows(payload);
        case ADD_DATASET:
            return addPatientRows(payload);
        case REMOVE_DATASET:
            return removeDataset(payload);
        case CLEAR_PATIENTS:
            return clearPatients(payload);
        case GET_PATIENTS:
            return getPatients(payload);
        case GET_SINGLETON_CSV:
            return getSingletonDataCsv(payload);
        case GET_MULTIROW_CSV:
            return getMultirowDataCsv(payload);
        case GET_ALL_DATA:
            return getAllData(payload);
        default:
            return null;
    }
};
/*
 * Clear all datasets and patient data.
 */
var clearPatients = function (payload) {
    patientMap = new Map();
    singletonDatasets = new Map();
    multirowDatasets = new Map();
    defaultPatientOrder = [];
    currentPatientOrder = [];
    return { requestId: payload.requestId };
};
/*
 * Removes a given dataset and any associated data,
 * returning an updated patient list.
 */
var removeDataset = function (payload) {
    var datasetId = payload.datasetId;
    singletonDatasets.delete(datasetId);
    multirowDatasets.delete(datasetId);
    patientMap.forEach(function (p) {
        p.multirowData.delete(datasetId);
        p.singletonData.delete(datasetId);
        setDetailRows(p.compoundId);
    });
    return getPatients(payload);
};
/*
 * Add server-sent data to the cache. An additional derived
 * dataset definition *may* be sent back to the caller
 * if the payload is a multirow dataset with rows.
 */
var addPatientRows = function (payload) {
    var dataset = payload.dataset, datasetDefinition = payload.datasetDefinition, demographics = payload.demographics, requestId = payload.requestId;
    var result = null;
    if (demographics) {
        addDatasetDefinition(datasetDefinition);
        addDemographics(payload);
    }
    else if (dataset) {
        // Add the multirow data. This returns a new Dataset Definition
        // for the summary statistics.
        addDatasetDefinition(dataset.definition);
        result = addMultiRowDataset(payload);
        addDatasetDefinition(result);
    }
    return { requestId: requestId, result: result };
};
/*
 * Add a dataset definition if not already present.
 */
var addDatasetDefinition = function (def) {
    var prop = def.multirow ? multirowDatasets : singletonDatasets;
    if (!prop.has(def.id)) {
        prop.set(def.id, def);
    }
};
/*
 * Add multirow dataset data to the cache.
 */
var addMultiRowDataset = function (payload) {
    var dataset = payload.dataset, responderId = payload.responderId;
    var def = dataset.definition;
    var dsId = def.id;
    var data = dataset.data.results;
    var dateFields = [];
    var uniquePatients = Object.keys(data);
    var uniqueCompoundPatients = [];
    var rowCount = 0;
    def.columns.forEach(function (c) {
        if (c.type === typeDate) {
            dateFields.push(c);
        }
    });
    // For each row
    for (var i = 0; i < uniquePatients.length; i++) {
        var p = uniquePatients[i];
        var rows = data[p];
        var compoundId = responderId + "_" + p;
        var pat = patientMap.get(compoundId);
        if (!pat) { continue; }

        var patientData = pat.multirowData;
        uniqueCompoundPatients.push(compoundId);
        // Convert strings to dates
        for (var j = 0; j < rows.length; j++) {
            var row = rows[j];
            for (var k = 0; k < dateFields.length; k++) {
                var f = dateFields[k].id;
                var v = row[f];
                if (v) {
                    row[f] = new Date(v);
                }
            }
        }
        if (!patientData.has(dsId)) {
            patientData.set(dsId, rows);
        }
    }
    // Pre-sort all values for each unique patient now that they are grouped
    for (var i = 0; i < uniqueCompoundPatients.length; i++) {
        var pat = patientMap.get(uniqueCompoundPatients[i]);
        var vals = pat.multirowData.get(dsId);
        if (vals) {
            var valsSorted = vals.sort(function (a, b) { return a[def.dateValueColumn] - b[def.dateValueColumn]; });
            pat.multirowData.set(dsId, valsSorted);
            rowCount += vals.length;
        }
    }
    // Rows are added to the patient map, now compute stats for each patient
    var derivedDef = def.numericValueColumn && dataset.data.schema.fields.indexOf(def.numericValueColumn) > -1
        ? deriveNumericSummaryFromDataset(def, uniqueCompoundPatients)
        : deriveNonNumericSummaryFromDataset(def, uniqueCompoundPatients);
    derivedDef.totalRows = rowCount;
    return derivedDef;
};
/*
 * Add initial base (basic demographics) dataset to the cache.
 */
var addDemographics = function (payload) {
    var datasetDefinition = payload.datasetDefinition, demographics = payload.demographics, responderId = payload.responderId, requestId = payload.requestId;
    if (!demographics.length) {
        return { requestId: requestId };
    }
    // For each patient
    for (var i = 0; i < demographics.length; i++) {
        // Add compound and responder ids
        var patientDto = demographics[i];
        var patient = {
            compoundId: responderId + "_" + patientDto.personId,
            detailRowCount: 0,
            detailValues: [],
            id: patientDto.personId,
            multirowData: new Map(),
            responderId: responderId,
            singletonData: new Map()
        };
        // Add to the patId arrays
        defaultPatientOrder.push(patient.compoundId);
        currentPatientOrder.push(patient.compoundId);
        // Add the demographics data
        patient.singletonData.set(datasetDefinition.id, new Map(Object.entries(patientDto)));
        // Add patient to map
        patientMap.set(patient.compoundId, patient);
    }
    return { requestId: requestId };
};
/*
 * Return an array of tabular patient data based
 * on provided configuration definition (the config is
 * basically a description of what is display in the UI).
 */
var getPatients = function (payload) {
    var config = payload.config;
    var requestId = payload.requestId;
    var NONE = 0;
    var newPats;
    // If no need to sort, go by the ingested order
    if (config.sort.sortType === NONE) {
        newPats = getUnsortedPatients(config);
    }
    // Else we need sorted
    else {
        if (config.sort.column.id !== currentSortColumn) {
            sortPatients(config);
        }
        else if (config.sort.column.id === currentSortColumn && config.sort.sortType !== currentSortType) {
            currentPatientOrder = currentPatientOrder.reverse();
        }
        newPats = getSortedPatients(config);
    }
    copySortType(config.sort);
    return { requestId: requestId, result: patientIdsToListRow(config, newPats) };
};
/*
 * After a tabular-dataset is returned to the caller,
 * cache a copy of the sorting definition here in the worker.
 * That way, next time data is requested we can check if
 * patients are already approprietly sorted and avoid needing
 * to reprocess.
 */
var copySortType = function (configSort) {
    if (!configSort.column) {
        return;
    }
    currentSortColumn = configSort.column.id;
    currentSortType = configSort.sortType;
};
/*
 * Return the actual tabular array to caller, row by row, tuple by tuple.
 * If a patient doesn't have data for a given dataset/column, return undefined.
 */
var patientIdsToListRow = function (config, patIds) {
    var patList = [];
    var _loop_1 = function (i) {
        var pat = patientMap.get(patIds[i]);
        var patListRow = {
            compoundId: pat.compoundId,
            detailRowCount: pat.detailRowCount,
            detailValues: pat.detailValues,
            isOpen: false,
            responderId: pat.responderId,
            values: []
        };
        patListRow.values = config.displayColumns.map(function (col) {
            var ds = pat.singletonData.get(col.datasetId);
            if (!ds) {
                return undefined;
            }
            return ds.get(col.id);
        });
        patList.push(patListRow);
    };
    for (var i = 0; i < patIds.length; i++) {
        _loop_1(i);
    }
    return patList;
};
/*
 * Order all multirow data from latest to earliest, grouping
 * by encounters. This will be visible when the user clicks
 * on a patient row to drill down.
 */
var setDetailRows = function (patId) {
    var pat = patientMap.get(patId);
    var allDetails = [];
    var encMap = new Map();
    var rowCount = 0;
    // Get all encounter detail rows in an array
    pat.multirowData.forEach(function (vals, key) {
        var ds = multirowDatasets.get(key);
        var cols = Array.from(ds.columns.keys()).filter(function (v) { return v !== 'personId' && v !== 'encounterId' && v !== ds.dateValueColumn; });
        var hasEncounterIdCol = !!vals[0].encounterId;
        var _loop_2 = function (i) {
            var val = vals[i];
            if (val && val[ds.dateValueColumn])
                rowCount++;
            allDetails.push({
                columns: cols.map(function (k) { return ({ key: k, value: val[k] }); }),
                datasetName: ds.displayName,
                date: val[ds.dateValueColumn],
                dateColumnName: ds.dateValueColumn,
                encounterId: hasEncounterIdCol ? val.encounterId : 'Unknown Encounter'
            });
        };
        for (var i = 0; i < vals.length; i++) {
            _loop_2(i);
        }
    });
    var getTime = function (date) { return date ? date.getTime() : 0; };
    var sorted = allDetails
        .sort(function (a, b) { return getTime(b.date) - getTime(a.date); });
    // Group details by encounterId
    for (var j = 0; j < sorted.length; j++) {
        var row = sorted[j];
        if (encMap.has(row.encounterId)) {
            encMap.get(row.encounterId).push(row);
        }
        else {
            encMap.set(row.encounterId, [row]);
        }
    }
    // Set the grouped encounter data rows as the patient's detail array
    pat.detailValues = [];
    encMap.forEach(function (v, k) { return pat.detailValues.push({ encounterId: k, rows: v }); });
    pat.detailRowCount = rowCount;
};
/*
 * Return patient ids unsorted.
 */
var getUnsortedPatients = function (config) {
    var offset = config.pageNumber * config.pageSize;
    var patIds = defaultPatientOrder.slice(offset, offset + config.pageSize);
    return patIds;
};
/*
 * Return patient ids sorted.
 */
var getSortedPatients = function (config) {
    var offset = config.pageNumber * config.pageSize;
    var patIds = currentPatientOrder.slice(offset, offset + config.pageSize);
    return patIds;
};
/*
 * Sort the cached patient ids by a given column and sort order.
 */
var sortPatients = function (config) {
    var _a = config.sort.column, datasetId = _a.datasetId, id = _a.id;
    var ASC = 1;
    // Set the sort algorithm to sort ASC or DESC
    var sortAlgo = config.sort.sortType === ASC
        ? function (p, p2) { return (p.value < p2.value ? -1 : p.value > p2.value ? 1 : 0); }
        : function (p, p2) { return (p2.value < p.value ? -1 : p2.value > p.value ? 1 : 0); };
    // Derive an array from the map and sort by column and algorithm
    currentPatientOrder = Array.from(patientMap)
        .map(function (p) {
        var ds = p[1].singletonData.get(datasetId);
        var value = ds ? ds.get(id) : null;
        return {
            id: p[1].compoundId,
            value: value ? value : 0
        };
    })
        .sort(sortAlgo)
        .map(function (p) { return p.id; });
};
/*
 * Define a derivedNumericColumns template for
 * storing summarized stats from numeric datasets.
 */
var getDerivedNumericColumnsTemplate = function () {
    // tslint:disable
    return {
        trend: { id: 'Trend', isDisplayed: true, type: typeSparkline },
        count: { id: 'Count', isDisplayed: true, type: typeNum },
        mean: { id: 'Mean', type: typeNum },
        median: { id: 'Median', type: typeNum },
        min: { id: 'Min', type: typeNum },
        max: { id: 'Max', type: typeNum },
        mostRecent: { id: 'MostRecent', type: typeString },
        mostRecentDate: { id: 'MostRecentDate', type: typeDate },
        earliest: { id: 'Earliest', type: typeString },
        earliestDate: { id: 'EarliestDate', type: typeDate }
    };
    // tslint:enable
};
/*
 * Define a derivedNumericColumns template for
 * storing summarized stats from datasets.
 */
var getDerivedNonNumericColumnsTemplate = function () {
    // tslint:disable
    return {
        count: { id: 'Count', isDisplayed: true, type: typeNum },
        mostRecent: { id: 'MostRecent', type: typeString },
        mostRecentDate: { id: 'MostRecentDate', type: typeDate },
        earliest: { id: 'Earliest', type: typeString },
        earliestDate: { id: 'EarliestDate', type: typeDate }
    };
    // tslint:enable
};
/*
 * Return a map and column id lookup object for
 * a given dataset definition.
 */
var getNumericSummaryDatasetColums = function (def) {
    var caps = /([A-Z])/g;
    var firstToUpper = /^./;
    var camelCaseToUpperSpaced = function (colName) { return colName.replace(caps, ' $1').replace(firstToUpper, function (col) { return col.toUpperCase(); }); };
    var cols = Object.assign({}, getDerivedNumericColumnsTemplate());
    Array.from(Object.keys(cols)).forEach(function (k, i) {
        var col = cols[k];
        col.index = i;
        col.displayName = "" + def.displayName + camelCaseToUpperSpaced(col.id);
        col.id = (def.displayName + "_" + col.id).toLowerCase().replace(' ', '_');
        col.isDisplayed = col.isDisplayed || false;
        col.datasetId = def.id;
    });
    return {
        lookup: {
            count: cols.count.id,
            earliest: cols.earliest.id,
            earliestDate: cols.earliestDate.id,
            max: cols.max.id,
            mean: cols.mean.id,
            median: cols.median.id,
            min: cols.min.id,
            mostRecent: cols.mostRecent.id,
            mostRecentDate: cols.mostRecentDate.id,
            trend: cols.trend.id
        },
        map: new Map([
            [cols.trend.id, cols.trend],
            [cols.count.id, cols.count],
            [cols.mean.id, cols.mean],
            [cols.median.id, cols.median],
            [cols.min.id, cols.min],
            [cols.max.id, cols.max],
            [cols.mostRecent.id, cols.mostRecent],
            [cols.mostRecentDate.id, cols.mostRecentDate],
            [cols.earliest.id, cols.earliest],
            [cols.earliestDate.id, cols.earliestDate]
        ])
    };
};
/*
 * Derive a summary numeric singleton dataset from
 * a multirow numeric dataset. The new dataset definition
 * is returned to the caller, and rows are added to the cache.
 */
var deriveNumericSummaryFromDataset = function (def, ids) {
    var cols = getNumericSummaryDatasetColums(def);
    var sumDef = {
        columns: cols.map,
        displayName: def.displayName,
        id: def.id,
        multirow: false,
        numericValueColumn: def.numericValueColumn,
        responderStates: new Map(),
        shape: 0,
        totalRows: ids.length
    };
    // Short-circuit if the dataset doesn't have a date or numeric column
    if (!def.dateValueColumn || !def.numericValueColumn) {
        return sumDef;
    }
    for (var i = 0; i < ids.length; i++) {
        var p = patientMap.get(ids[i]);
        var data = p.multirowData.get(def.id);
        var ds = new Map();
        // Make sure we have data to work with
        if (!data) {
            continue;
        }
        var vals = data.map(function (d) { return ({ x: d[def.dateValueColumn], y: d[def.numericValueColumn] }); });
        var numVals = vals.filter(function (d) { return +d.y; }).sort(function (a, b) { return a.y - b.y; });
        // Compute earliest and latest
        var firstDate = vals[0].x;
        var firstVal = vals[0].y;
        var lastDate = vals[vals.length - 1].x;
        var lastVal = vals[vals.length - 1].y;
        ds.set(cols.lookup.earliestDate, firstDate);
        ds.set(cols.lookup.earliest, firstVal);
        ds.set(cols.lookup.mostRecentDate, lastDate);
        ds.set(cols.lookup.mostRecent, lastVal);
        ds.set(cols.lookup.count, vals.length);
        // Compute numeric stats
        if (numVals.length) {
            var min = numVals[0].y;
            var max = numVals[numVals.length - 1].y;
            var mean = +(((numVals.reduce(function (a, b) { return a + b.y; }, 0)) / numVals.length).toFixed(1));
            var half = Math.floor(numVals.length / 2);
            var median = numVals.length % 2
                ? numVals[half].y
                : (numVals[half - 1].y + numVals[half].y) / 2.0;
            ds.set(cols.lookup.min, min);
            ds.set(cols.lookup.max, max);
            ds.set(cols.lookup.mean, mean);
            ds.set(cols.lookup.median, median);
            ds.set(cols.lookup.trend, vals);
        }
        p.singletonData.set(def.id, ds);
        patientMap.set(p.compoundId, p);
        setDetailRows(p.compoundId);
    }
    return sumDef;
};
/*
 * Return a map and column id lookup object for
 * a given non-numeric dataset definition.
 */
var getNonNumericSummaryDatasetColums = function (def) {
    var caps = /([A-Z])/g;
    var firstToUpper = /^./;
    var camelCaseToUpperSpaced = function (colName) { return colName.replace(caps, ' $1').replace(firstToUpper, function (col) { return col.toUpperCase(); }); };
    var cols = getDerivedNonNumericColumnsTemplate();
    Array.from(Object.keys(cols)).forEach(function (k, i) {
        var col = cols[k];
        col.index = i;
        col.displayName = "" + def.displayName + camelCaseToUpperSpaced(col.id);
        col.id = (def.displayName + "_" + col.id).toLowerCase().replace(' ', '_');
        col.isDisplayed = col.isDisplayed || false;
        col.datasetId = def.id;
    });
    return {
        lookup: {
            count: cols.count.id,
            earliest: cols.earliest.id,
            earliestDate: cols.earliestDate.id,
            mostRecent: cols.mostRecent.id,
            mostRecentDate: cols.mostRecentDate.id,
        },
        map: new Map([
            [cols.count.id, cols.count],
            [cols.mostRecent.id, cols.mostRecent],
            [cols.mostRecentDate.id, cols.mostRecentDate],
            [cols.earliest.id, cols.earliest],
            [cols.earliestDate.id, cols.earliestDate]
        ])
    };
};
/*
 * Derive a summary non-numeric singleton dataset from
 * a multirow numeric dataset. The new dataset definition
 * is returned to the caller, and rows are added to the cache.
 */
var deriveNonNumericSummaryFromDataset = function (def, ids) {
    var cols = getNonNumericSummaryDatasetColums(def);
    var sumDef = {
        columns: cols.map,
        displayName: def.displayName,
        id: def.id,
        multirow: false,
        responderStates: new Map(),
        shape: 0
    };
    // Short-circuit if the dataset doesn't have a date or numeric column
    if (!def.dateValueColumn || !def.stringValueColumn) {
        return sumDef;
    }
    for (var i = 0; i < ids.length; i++) {
        var p = patientMap.get(ids[i]);
        var data = p.multirowData.get(def.id);
        var ds = new Map();
        // Make sure we have data to work with
        if (!data) {
            continue;
        }
        var vals = data.map(function (d) { return ({ x: d[def.dateValueColumn], y: d[def.stringValueColumn] }); });
        // Compute earliest and latest
        var firstDate = vals[0].x;
        var firstVal = vals[0].y;
        var lastDate = vals[vals.length - 1].x;
        var lastVal = vals[vals.length - 1].y;
        ds.set(cols.lookup.earliestDate, firstDate);
        ds.set(cols.lookup.earliest, firstVal);
        ds.set(cols.lookup.mostRecentDate, lastDate);
        ds.set(cols.lookup.mostRecent, lastVal);
        ds.set(cols.lookup.count, vals.length);
        p.singletonData.set(def.id, ds);
        patientMap.set(p.compoundId, p);
        setDetailRows(p.compoundId);
    }
    return sumDef;
};
/*
 * Convert tuple objects to csv-friendly strings.
 */
var valueToCsvString = function (d) {
    return !d 
        ? '' : d instanceof Date 
        ? d.toLocaleString().replace(',', '') : '';
};
/*
 * Pulls all cache data for all datasets into a
 * JSON object for export (currently only to REDCap).
 */
var getAllData = function (payload) {
    var config = payload.config, requestId = payload.requestId, useDisplayedColumnsOnly = payload.useDisplayedColumnsOnly;
    var data = [];
    var singletonData = { columns: [], data: [], datasetId: 'demographics', isMultirow: false, maxRows: 1 };
    var colPersonId = 'personId';
    // Add the personId column
    singletonData.columns.push(singletonDatasets.get('demographics').columns.get(colPersonId));
    // Use only the columns currently displayed or retrieve all (user selects one option or the other)
    if (useDisplayedColumnsOnly) {
        singletonData.columns.concat(config.displayColumns.filter(function (col) { return col.type !== typeSparkline && col.id !== colPersonId; }));
    }
    else {
        singletonDatasets.forEach(function (def) {
            def.columns.forEach(function (col) {
                if (col.type !== typeSparkline && col.id !== colPersonId) {
                    singletonData.columns.push(col);
                }
            });
        });
    }
    // Add singleton rows
    patientMap.forEach(function (p) {
        var row = {};
        singletonData.columns.forEach(function (col) {
            var ds = p.singletonData.get(col.datasetId);
            var d = ds ? ds.get(col.id) : '';
            row[col.id] = d;
        });
        row[colPersonId] = p.compoundId;
        singletonData.data.push(row);
    });
    data.push(singletonData);
    // Add multirow rows
    multirowDatasets.forEach(function (mds) {
        var mdsName = mds.displayName.replace(' ', '_').toLowerCase();
        var mdsCols = [{ id: colPersonId, datasetId: mdsName, index: 0, isDisplayed: true, type: typeString }];
        mds.columns.forEach(function (col) { return mdsCols.push(col); });
        var exportData = { columns: mdsCols, data: [], datasetId: mdsName, dateValueColumn: mds.dateValueColumn, isMultirow: true, maxRows: 1 };
        patientMap.forEach(function (p) {
            var ds = p.multirowData.get(mds.id);
            var rowCount = 0;
            if (ds) {
                for (var i = 0; i < ds.length; i++) {
                    var row = [];
                    var vals = ds[i];
                    for (var j = 0; j < mdsCols.length; j++) {
                        var d = vals[mdsCols[j].id];
                        if (d) {
                            row[mdsCols[j].id] = d;
                            rowCount++;
                        }
                    }
                    row[colPersonId] = p.compoundId;
                    exportData.data.push(row);
                }
            }
            exportData.maxRows = rowCount > exportData.maxRows ? rowCount : exportData.maxRows;
        });
        data.push(exportData);
    });
    return { requestId: requestId, result: data };
};
/*
 * Converts cache data to csv format
 * for a given multirow dataset.
 */
var getMultirowDataCsv = function (payload) {
    var datasetId = payload.datasetId, requestId = payload.requestId;
    var nl = '';
    var rows = [];
    var cols = [{ id: 'personId', datasetId: datasetId, index: 0, isDisplayed: true, type: typeString }];
    multirowDatasets.get(datasetId).columns.forEach(function (col) { return cols.push(col); });
    // Add column headers
    rows.push(cols.map(function (col) { return col.id; }).join(','));
    // Add rows
    patientMap.forEach(function (p) {
        var ds = p.multirowData.get(datasetId);
        if (ds) {
            for (var i = 0; i < ds.length; i++) {
                var row = [];
                var vals = ds[i];
                for (var j = 0; j < cols.length; j++) {
                    var d = vals[cols[j].id];
                    row.push("" + valueToCsvString(d) + "");
                }
                rows.push(row.join(','));
            }
        }
    });
    return { requestId: requestId, result: rows.join(nl) };
};
/*
 * Converts cache data to csv format
 * representing the columnar table displayed
 * in the UI.
 */
var getSingletonDataCsv = function (payload) {
    var config = payload.config, requestId = payload.requestId, useDisplayedColumnsOnly = payload.useDisplayedColumnsOnly;
    var nl = '';
    var rows = [];
    var cols = [];
    // Use only the columns currently displayed or retrieve all (user selects one option or the other)
    if (useDisplayedColumnsOnly) {
        cols = config.displayColumns.filter(function (col) { return col.type !== typeSparkline; });
    }
    else {
        singletonDatasets.forEach(function (def) {
            def.columns.forEach(function (col) {
                if (col.type !== typeSparkline) {
                    cols.push(col);
                }
            });
        });
    }
    // Add column headers
    rows.push(cols.map(function (col) { return col.id; }).join(','));
    // Add rows
    patientMap.forEach(function (p) {
        var row = [];
        cols.forEach(function (col) {
            var ds = p.singletonData.get(col.datasetId);
            var d = ds ? ds.get(col.id) : undefined;
            row.push("" + valueToCsvString(d) + "");
        });
        rows.push(row.join(','));
    });
    return { requestId: requestId, result: rows.join(nl) };
};
`;