"use strict";
exports.__esModule = true;
var Stream_1 = require("./Stream");
var CourseNames = require('../crawler/courses.json');
var Course = /** @class */ (function () {
    function Course(courseData) {
        this.code = courseData.code;
        this.name = courseData.name;
        this.streams = courseData.streams;
        this.term = courseData.term || undefined;
        this.useWebStream = courseData.useWebStream || false;
    }
    Course.from = function (data) {
        var code = data.code.trim();
        return new Course({
            code: code,
            name: (CourseNames[code]) || data.name.trim(),
            streams: [],
            term: (/ \(([A-Z][A-Z0-9]{2})\)/.exec(data.name) || [])[1]
        });
    };
    Course.prototype.addStream = function (data) {
        var stream = Stream_1.Stream.from(data);
        if (stream !== null) {
            this.streams.push(stream);
        }
    };
    Course.prototype.updateWith = function (data) {
        var newObject = Object.create(this);
        return Object.assign(newObject, data);
    };
    Course.prototype.removeDuplicates = function () {
        var mapping = new Map();
        for (var _i = 0, _a = this.streams; _i < _a.length; _i++) {
            var stream = _a[_i];
            var times = stream.times !== null ? stream.times.map(function (t) { return t.time; }) : null;
            var key = stream.component + ("[" + times + "]");
            mapping.set(key, (mapping.get(key) || []).concat(stream));
        }
        // For each set of streams with identical component and times,
        for (var _b = 0, _c = Array.from(mapping.values()); _b < _c.length; _b++) {
            var streams = _c[_b];
            var emptiest = emptiestStream(streams);
            for (var _d = 0, streams_1 = streams; _d < streams_1.length; _d++) {
                var stream = streams_1[_d];
                if (stream !== emptiest) {
                    this.streams.splice(this.streams.indexOf(stream), 1);
                }
            }
        }
    };
    return Course;
}());
exports.Course = Course;
var emptiestStream = function (streams) {
    var bestStream = null;
    var bestRatio = Infinity;
    for (var _i = 0, streams_2 = streams; _i < streams_2.length; _i++) {
        var stream = streams_2[_i];
        var ratio = stream.enrols[0] / stream.enrols[1];
        if (ratio < bestRatio) {
            bestRatio = ratio;
            bestStream = stream;
        }
    }
    return bestStream;
};
exports["default"] = Course;
