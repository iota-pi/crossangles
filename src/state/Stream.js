"use strict";
exports.__esModule = true;
var util_1 = require("./util");
var Stream = /** @class */ (function () {
    function Stream(streamData) {
        this.component = streamData.component;
        this.enrols = streamData.enrols;
        this.times = streamData.times;
        this.full = streamData.full;
        this.web = streamData.web || false;
    }
    Stream.from = function (data) {
        var component = data.component;
        if (component === 'CRS') {
            return null;
        }
        var status = data.status.trim().replace(/\*$/, '').toLocaleLowerCase();
        if (status !== 'open' && status !== 'full') {
            return null;
        }
        var full = status === 'full';
        var enrols = data.enrols.split(' ')[0].split('/').map(function (x) { return parseInt(x); });
        if (enrols[1] === 0) {
            return null;
        }
        var web = false;
        var times = null;
        if (data.section.indexOf('WEB') === -1) {
            times = util_1.parseTimeStr(data.times);
            if (times === null || times.length === 0) {
                return null;
            }
        }
        else {
            web = true;
            // Standardise all web streams as 'LEC' component
            component = 'LEC';
        }
        return new Stream({ component: component, enrols: enrols, times: times, full: full, web: web });
    };
    return Stream;
}());
exports.Stream = Stream;
exports["default"] = Stream;
