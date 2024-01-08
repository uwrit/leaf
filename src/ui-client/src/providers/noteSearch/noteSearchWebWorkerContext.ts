/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 
export const workerContext = `
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var STOP_WORDS = new Set(['\\n', '\\t', '(', ')', '"', ";"]);
var unigramIndex = new Map();
var docIndex = new Map();
// eslint-disable-next-line
var handleWorkMessage = function (payload) {
    switch (payload.message) {
        case INDEX:
            return indexDocuments(payload);
        case FLUSH:
            return flushNotes(payload);
        case SEARCH:
            return searchNotes(payload);
        case PREFIX_SEARCH:
            return searchPrefix(payload);
        default:
            return null;
    }
};

const indexDocuments = (payload) => {
    const { requestId } = payload;
    const { datasets } = payload;
    const notes = [];
    /* Process as notes */
    for (let i = 0; i < datasets.length; i++) {
        const result = datasets[i];
        const schema = result.dataset.schema;
        let j = 0;
        for (const patId of Object.keys(result.dataset.results)) {
            for (const row of result.dataset.results[patId]) {
                const note = {
                    responderId: result.responder.id,
                    id: result.responder.id + '_' + j.toString(),
                    date: new Date(row[schema.sqlFieldDate]),
                    text: row[schema.sqlFieldValueString],
                    type: result.query.name
                };
                notes.push(note);
                j++;
            }
        }
    }
    /* Index text */
    for (let i = 0; i < notes.length; i++) {
        const note = notes[i];
        const tokens = tokenizeDocument(note);
        const doc = { id: note.id, date: note.date.toString(), note_type: note.type, text: note.text };
        let prev;
        for (let j = 0; j < tokens.length; j++) {
            const token = tokens[j];
            const lexeme = token.lexeme;
            if (STOP_WORDS.has(lexeme))
                continue;
            // Radix-tree check
            let indexed = unigramIndex.get(lexeme);
            if (indexed) {
                indexed.instances.push(token);
            }
            else {
                indexed = { lexeme, instances: [token], next: new Map() };
                unigramIndex.set(lexeme, indexed);
            }
            if (prev) {
                let prevIndexed = prev.next.get(lexeme);
                if (!prevIndexed) {
                    prev.next.set(lexeme, indexed);
                }
            }
            prev = indexed;
        }
        docIndex.set(doc.id, doc);
    }
    return { requestId };
};


var flushNotes = function (payload) {
    var requestId = payload.requestId;
    unigramIndex.clear();
    docIndex.clear();
    return { requestId: requestId };
};
var searchNotes = function (payload) {
    var requestId = payload.requestId, terms = payload.terms;
    var result = { documents: [] };
    if (!terms.length) {
        console.log('no terms!')
        return { requestId, result };
    }
    var precedingHits = new Map();
    var _loop_1 = function (i) {
        var term = terms[i];
        var hits = term.text.split(' ').length > 1
            ? searchMultiterm(term)
            : searchSingleTerm(term);
        if (!hits.size)
            return { value: { requestId: requestId, result: result } };
        if (precedingHits.size) {
            var merged_1 = new Map();
            precedingHits.forEach(function (v, k) {
                if (hits.has(k)) {
                    var both = hits.get(k).concat(v);
                    merged_1.set(k, both);
                }
            });
            precedingHits = merged_1;
        }
        else {
            precedingHits = hits;
        }
    };
    for (var i = 0; i < terms.length; i++) {
        var state_1 = _loop_1(i);
        if (typeof state_1 === "object")
            return state_1.value;
    }
    precedingHits.forEach(function (v, k) {
        var doc = __assign(__assign({}, docIndex.get(k)), { lines: [] });
        var hits = v.sort(function (a, b) { return a.charIndex.start - b.charIndex.start; });
        var context = getSearchResultDocumentContext(doc, hits);
        result.documents.push(context);
    });
    return { requestId: requestId, result: result };
};
var getSearchResultDocumentContext = function (doc, hits) {
    var contextCharDistance = 50;
    var groups = [];
    // Group by character distance
    for (var i = 0; i < hits.length; i++) {
        var hit = hits[i];
        var group = [hit];
        var nextIndex = 1;
        while (true) {
            var nextHit = i < hits.length - 1 ? hits[i + nextIndex] : undefined;
            // If overlapping
            if (nextHit && hit.lineIndex === nextHit.lineIndex &&
                (hit.charIndex.end + contextCharDistance) >= (nextHit.charIndex.start - contextCharDistance)) {
                // Merge lines
                group.push(nextHit);
                hits.splice(i + nextIndex, 1);
                nextIndex++;
            }
            else {
                groups.push(group);
                break;
            }
        }
    }
    var result = __assign(__assign({}, doc), { lines: [] });
    for (var i = 0; i < groups.length; i++) {
        var group = groups[i];
        var line = { index: group[0].lineIndex, content: [] };
        for (var j = 0; j < group.length; j++) {
            var backLimit = j > 0 ? group[j].charIndex.start : undefined;
            var forwLimit = j < group.length - 1 ? group[j + 1].charIndex.start : undefined;
            var context = getContext(doc, group[j], contextCharDistance, backLimit, forwLimit);
            line.content = line.content.concat(context);
        }
        result.lines.push(line);
    }
    return result;
};
var getContext = function (doc, hit, contextCharDistance, backLimit, forwLimit) {
    var _backLimit = backLimit === undefined ? hit.charIndex.start - contextCharDistance : backLimit;
    var _forwLimit = forwLimit === undefined ? hit.charIndex.end + contextCharDistance : forwLimit;
    var backContext = doc.text.substring(_backLimit, hit.charIndex.start);
    var forwContext = doc.text.substring(hit.charIndex.end, _forwLimit);
    if (!backLimit && backContext)
        backContext = '...' + backContext;
    if (!forwLimit && forwContext)
        forwContext += '...';
    var back_i = backContext.length - 1;
    while (back_i > -1) {
        if (backContext[back_i] === '\\n') {
            backContext = backContext.substring(back_i, backContext.length - 1);
            break;
        }
        back_i--;
    }
    var forw_i = 1;
    while (forw_i < forwContext.length - 1) {
        if (forwContext[forw_i] === '\\n') {
            forwContext = forwContext.substring(0, forw_i);
            break;
        }
        forw_i++;
    }
    var output = [
        { type: "MATCH", text: doc.text.substring(hit.charIndex.start, hit.charIndex.end), matchedTerm: hit.searchTerm }
    ];
    if (backContext.trim())
        output.unshift({ type: "CONTEXT", text: backContext });
    if (forwContext.trim())
        output.push({ type: "CONTEXT", text: forwContext });
    return output;
};
var searchSingleTerm = function (term) {
    var result = new Map();
    var hit = unigramIndex.get(term.text.toLocaleLowerCase());
    if (hit) {
        for (var i = 0; i < hit.instances.length; i++) {
            var instance = hit.instances[i];
            if (result.has(instance.docId)) {
                result.get(instance.docId).push(__assign(__assign({}, instance), { searchTerm: term }));
            }
            else {
                result.set(instance.docId, [__assign(__assign({}, instance), { searchTerm: term })]);
            }
        }
    }
    return result;
};
var searchMultiterm = function (searchTerm) {
    var result = new Map();
    var terms = searchTerm.text.toLocaleLowerCase().split(' ');
    // First term
    var term = terms[0];
    var hit = unigramIndex.get(term);
    if (!hit)
        return result;
    var expected = new Map(hit.instances.filter(function (t) { return !!t.nextId; }).map(function (t) { return [t.nextId, [t]]; }));
    var next = hit.next;
    // Following
    for (var j = 1; j < terms.length; j++) {
        var term_1 = terms[j];
        var hit_1 = next.get(term_1);
        if (hit_1) {
            var matched = hit_1.instances.filter(function (t) { return expected.has(t.id); });
            if (!matched.length)
                return result;
            if (j < terms.length - 1) {
                expected = new Map(matched.filter(function (t) { return !!t.nextId; }).map(function (t) { return [t.nextId, __spreadArray(__spreadArray([], expected.get(t.id), true), [t], false)]; }));
                next = hit_1.next;
            }
            else {
                expected = new Map(matched.map(function (t) { return [t.id, __spreadArray(__spreadArray([], expected.get(t.id), true), [t], false)]; }));
            }
        } else {
            return result;
        }
    }
    expected.forEach(function (v, k) {
        var docId = v[0].docId;
        var charIndex = { start: v[0].charIndex.start, end: v[v.length - 1].charIndex.end };
        var lineIndex = v[0].lineIndex;
        if (result.has(docId)) {
            result.get(docId).push({ docId: docId, charIndex: charIndex, lineIndex: lineIndex, searchTerm: searchTerm });
        }
        else {
            result.set(docId, [{ docId: docId, charIndex: charIndex, lineIndex: lineIndex, searchTerm: searchTerm }]);
        }
    });
    return result;
};
var tokenizeDocument = function (note) {  
    var source = note.text.toLocaleLowerCase();  
    var tokens = [];  
    var line = 0;  
    var start = 0;  
    var current = 0;  
  
    var scanToken = function () {  
        var c = advance();  
        switch (c) {  
            case ' ':  
            case '\\r':  
            case '\\t':  
            case '\\n':  
                break;  
            default:  
                toToken();  
                break;  
        }  
    };  
  
    var toNewLine = function () {  
        line++;  
    };  
  
    var toToken = function () {  
        while (isAlphaNumeric(peek())) advance();  
        addToken();  
    };  
  
    var peek = function () {  
        if (isAtEnd()) return '\\0';  
        return source[current];  
    };  
  
    var isAlphaNumeric = function (c) {  
        var regex = /^[a-z0-9]+$/i;  
        return regex.test(c);  
    };  
  
    var isAtEnd = function () {  
        return current >= source.length;  
    };  
  
    var advance = function () {  
        return source[current++];  
    };  
  
    var addToken = function () {  
        var text = source.substring(start, current);  
        var token = {  
            lexeme: text,  
            charIndex: { start: start, end: current },  
            docId: note.id,  
            id: note.id + '_' + tokens.length.toString(),  
            index: tokens.length,  
            lineIndex: line  
        };  
        if (tokens.length) {  
            var prev = tokens[tokens.length - 1];  
            if (prev.lineIndex === token.lineIndex) {  
                tokens[tokens.length - 1].nextId = token.id;  
            }  
        }  
        tokens.push(token);  
    };  
  
    while (!isAtEnd()) {  
        start = current;  
        scanToken();  
    }  
    return tokens;  
};  
`;