"use strict";
/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.__esModule = true;
var react_redux_1 = require("react-redux");
var react_1 = require("react");
var NoteSearchHeader_1 = require("../../components/NoteSearch/NoteSearchHeader/NoteSearchHeader");
var NoteSearchResults_1 = require("../../components/NoteSearch/NoteSearchResults/NoteSearchResults");
require("./NoteSearch.css");
var NoteSearch = /** @class */ (function (_super) {
    __extends(NoteSearch, _super);
    function NoteSearch() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.className = 'note-search';
        return _this;
    }
    NoteSearch.prototype.render = function () {
        var c = this.className;
        return (react_1["default"].createElement("div", { className: c },
            react_1["default"].createElement(NoteSearchHeader_1.NoteSearchHeader, __assign({}, this.props)),
            react_1["default"].createElement(NoteSearchResults_1.NoteSearchResults, __assign({}, this.props))));
    };
    return NoteSearch;
}(react_1["default"].PureComponent));
var mapStateToProps = function (state) {
    return {
        noteSearch: state.cohort.noteSearch
    };
};
var mapDispatchToProps = function (dispatch) {
    return {
        dispatch: dispatch
    };
};
exports["default"] = react_redux_1.connect(mapStateToProps, mapDispatchToProps)(NoteSearch);
