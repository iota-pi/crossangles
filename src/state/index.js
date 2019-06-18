"use strict";
exports.__esModule = true;
var Course_1 = require("./Course");
exports.Course = Course_1["default"];
var Stream_1 = require("./Stream");
exports.Stream = Stream_1["default"];
exports.baseCourses = [];
exports.baseMeta = {
    term: 1,
    year: 1960,
    updateDate: '',
    updateTime: '',
    signup: ''
};
exports.baseChosen = [];
exports.baseAdditional = [];
exports.baseEvents = ['The Bible Talks'];
exports.baseOptions = {
    showEnrolments: false,
    showLocations: false,
    showWeeks: false,
    includeFull: false
};
exports.baseCustom = [];
exports.baseState = {
    courses: exports.baseCourses,
    meta: exports.baseMeta,
    chosen: exports.baseChosen,
    additional: exports.baseAdditional,
    events: exports.baseEvents,
    options: exports.baseOptions,
    custom: exports.baseCustom
};
