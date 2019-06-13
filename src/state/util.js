"use strict";
exports.__esModule = true;
exports.parseTimeStr = function (timeString) {
    // Basic string sanitisation
    timeString = timeString.replace(/\/odd|\/even|Comb\/w.*/g, '').trim();
    // Return empty list if no data has been given
    if (timeString === '') {
        return [];
    }
    if (timeString.indexOf('; ') !== -1) {
        var timeParts = timeString.split('; ');
        var times = timeParts.reduce(function (a, t) { return a.concat(_parseDataStr(t)); }, []);
        // Remove any duplicate times
        var timeSet = new Set();
        var finalTimes = [];
        for (var _i = 0, times_1 = times; _i < times_1.length; _i++) {
            var time = times_1[_i];
            if (!timeSet.has(time.time)) {
                timeSet.add(time.time);
                finalTimes.push(time);
            }
        }
        return finalTimes;
    }
    else {
        return _parseDataStr(timeString);
    }
};
var _parseDataStr = function (data) {
    var openBracketIndex = data.indexOf('(');
    if (openBracketIndex !== -1) {
        var time = tidyUpTime(data.slice(0, openBracketIndex).trim());
        if (time === null) {
            return [];
        }
        var otherDetails = data.slice(openBracketIndex, data.indexOf(')'));
        var weeks = getWeeks(otherDetails);
        if (weeks === null) {
            return [];
        }
        var commaIndex = otherDetails.indexOf(', ');
        var location_1 = '';
        if (commaIndex !== -1) {
            location_1 = otherDetails.slice(commaIndex + 2);
        }
        else if (otherDetails.length > 0 && otherDetails[0] !== 'w') {
            location_1 = otherDetails;
        }
        location_1 = location_1.toLowerCase() !== 'see school' ? location_1 : '';
        return [{
                time: time,
                weeks: weeks || undefined,
                location: location_1 || undefined
            }];
    }
    else {
        var time = tidyUpTime(data);
        return time !== null ? [{ time: time }] : [];
    }
};
var tidyUpTime = function (time) {
    if (time === '' || time === '00-00') {
        return null;
    }
    var days = { 'Mon': 'M', 'Tue': 'T', 'Wed': 'W', 'Thu': 'H', 'Fri': 'F', 'Sat': 'S', 'Sun': 's' };
    for (var _i = 0, _a = Object.entries(days); _i < _a.length; _i++) {
        var _b = _a[_i], day = _b[0], letter = _b[1];
        time = time.replace(day + ' ', letter);
    }
    // Use decimal notation for half-hours
    time = time.replace(':30', '.5');
    // Remove leading zeros
    time = time.replace(/(?<=[MTWHFSs])0(?=[0-9])/, '');
    // Don't include courses which run over multiple days (usually intensives) or on weekends
    if (isNaN(+time[1]) || time.toLocaleLowerCase().indexOf('s') !== -1) {
        return null;
    }
    return time;
};
var getWeeks = function (weeks) {
    weeks = weeks.split(', ')[0].replace(/^[, ]|[, ]$/g, '');
    if (weeks === '' || weeks[0] !== 'w' || weeks === 'w') {
        if (weeks === 'w') {
            console.warn('turns out weeks can be just a single w');
        }
        return '';
    }
    weeks = weeks.replace(/^w/, '');
    // Don't include classes which only run outside of regular term weeks
    if (/^((11|N[0-9]|< ?1)[, ]*)*$/.test(weeks)) {
        return null;
    }
    return weeks;
};
