/* generate.js
 *
 * Steps:
 * 1. Make a list of all class time options
 * 2. Sort list based on:
 *    - Prioritise non-full classes (but keep full ones too!)
 *    - Low # of options first
 *    - Sort based on time
 *    - Sort on some preference of days of week (to try get off days)
 *    - Class duration?
 * 3. Backtracking search
 *
 */

// Stop jslint complaining about regexs
/*jslint regexp: true */
/*globals $, console, courseList */

function generate(data) {
    // data = {code: [[class_type, status, enrolments, [[class_time, class_locations], ...]], ...]}
    'use strict';

    function makeHash() {
        var list = {}, course, coursedata, classdata, timedata, classtime, i, j;

        for (course in data) {
            // Loop through only properties which are not inherited
            if (data.hasOwnProperty(course)) {
                list[course] = {};

                coursedata = data[course];
                for (i = 0; i < coursedata.length; i += 1) {
                    classdata = coursedata[i];
                    timedata  = classdata[3];
                    classtime = [];
                    for (j = 0; j < timedata.length; j += 1) {
                        classtime.push(timedata[j][0]);
                    }
                    classtime = classtime.join(',');

                    // Make an entry in the list
                    // Format = { course_code: { component: [class_time, status, enrolments, course_code, component], ... }, ...}
                    if (!list[course].hasOwnProperty(classdata[0])) {
                        // Initial list
                        list[course][classdata[0]] = [];
                    }
                    // Add this stream's data to the list for the component
                    list[course][classdata[0]].push([classtime, classdata[1], classdata[2], course, classdata[0]]);
                }
            }
        }

        return list;
    }

    // Heuristic function
    function heuristic(a, b) {
        // Time priority order for class starting at given time
        var timeorder = [12, 13, 14, 11, 15, 16, 10, 17, 18, 19, 20, 9, 21, 22, 23, 8, 7, 6, 5, 4, 3, 2, 1, 0],
        // Day priority order (Wed is generally a more desirable day-off)
            dayorder = ['M', 'T', 'H', 'F', 'W', 'S', 's'],
        // Variable initialisation for option counting
            optCount = {},
            i,
            key,
        // Resultant heuristic variable
            result,
            fnOrder;

        // Sort by best time
        function timesort(a, b) {
            // Get all end times of classes in both stream a and b
            var timesA = a[0].replace(/[^\d\-,.]/g, '').split(/[,\-]/).map(function (x) { return Math.ceil(+x); }),
                timesB = b[0].replace(/[^\d\-,.]/g, '').split(/[,\-]/).map(function (x) { return Math.ceil(+x); }),
            // The priority of a class is the lowest priority of it's end times
            // (NB: any middle will never have a lower priority than an end)
                index = function (x) { return timeorder.indexOf(x); },
                indexA = Math.max.apply(null, timesA.map(index)),
                indexB = Math.max.apply(null, timesB.map(index));

            // Sort based on priority (index in timeorder)
            return indexA - indexB;
        }

        // Sort by best days
        function daysort(a, b) {
            // Get the days with classes on them for both of streams a and b
            var daysA = a[0].replace(/[\d\- ]/g, '').split(','),
                daysB = b[0].replace(/[\d\- ]/g, '').split(','),
            // Find the worst day and use this as the sorting priority
                index = function (x) { return dayorder.indexOf(x); },
                indexA = Math.max.apply(null, daysA.map(index)),
                indexB = Math.max.apply(null, daysB.map(index));

            return indexA - indexB;
        }

        // Sort by non-full classes
        function nonfull(a, b) {
            // Sort based on priority (index) and use original array position as a tiebreak
            return (a[1] === b[1]) ? 0 : ((a[1] === 'O') ? -1 : 1);
        }

        // Apply the heuristic sorting functions in order
        result = 0;
        fnOrder = [nonfull, timesort, daysort];
        while (result === 0) {
            // Use the next heuristic function
            result = (fnOrder.shift())(a, b);

            // No more ordering heuristics
            if (fnOrder.length === 0) { break; }
        }

        return result;
    }

    // Create the list of class time options
    var hash = makeHash(),
        list = [];

    // Sort the hash into a list
    (function sortHash() {
        var course, component;
        for (course in hash) {
            if (hash.hasOwnProperty(course)) {
                for (component in hash[course]) {
                    if (hash[course].hasOwnProperty(component)) {
                        list.push([hash[course][component].sort(heuristic), hash[course][component].length]);
                    }
                }
            }
        }
        // Order components based on # of streams for component
        list.sort(function (a, b) { return a[1] - b[1]; });
        // Remove stream count info
        list = list.map(function (x) { return x[0]; });
    }());

    // Checks whether two given time strings clash with each other
    function classClash(a, b) {
        // If days are different, then there is clearly no clash
        if (a[0] !== b[0]) { return false; }

        // Get start and end hours of both time strings
        a = a.replace(/[^\d\-.]/g, '').split('-');
        b = b.replace(/[^\d\-.]/g, '').split('-');

        // Ensure both have a length of 2
        if (a.length === 1) { a[1] = a[0]; }
        if (b.length === 1) { b[1] = b[0]; }

        // If the lower of one is bigger than the higher of the other, then there is no overlap
        // NB: if a[0] === a[1], then this is not always true; hence the extra "a[0] > b[0]" condition
        if ((a[0] >= b[1] && a[0] > b[0]) || (b[0] >= a[1] && b[0] > a[0])) {
            return false;
        }

        return true;
    }

    // Checks to see if the given time string clashes with any other time string in the timetable
    function checkClash(timetable, timestr) {
        var i, j, k, stream, times, time = timestr.split(',');
        for (i = 0; i < time.length; i += 1) {
            for (j = 0; j < timetable.length; j += 1) {
                stream = list[j][timetable[j]];
                times = stream[0].split(',');
                for (k = 0; k < times.length; k += 1) {
                    if (classClash(time[i], times[k])) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    // Do backtracking search
    function dfs() {
        var timetable = [],
            i = 0,
            component,
            index;

        while (i < list.length) {
            component = list[i];

            // Choose the first non-clashing stream
            index = timetable[i] || 0;
            while (checkClash(timetable, component[index][0])) {
                index += 1;
                if (index === component.length) {
                    break;
                }
            }

            // Check if we should backtrack or continue
            if (index === component.length) {
                //// Backtrack
                // Remove this item from the timetable
                timetable[i] = 0; // NB: set it first, in case it hasn't been set yet
                timetable.pop();

                // Step backwards
                i -= 1;

                // Impossibility Check
                if (i < 0) {
                    console.error('Could not generate timetable! Some clashes could not be resolved.');
                    return null;
                }
            } else {
                //// Continue
                timetable[i] = index;

                // Step forwards
                i += 1;
            }
        }

        // Transform index numbers into the actual data entries for the corresponding streams
        timetable = timetable.map(function (x, i) { return list[i][x]; });

        return timetable;
    }

    console.log(dfs());
}

function generateTimetable() {
    'use strict';

    var data = 'courses=' + encodeURI(JSON.stringify(courseList));
    $.getJSON('data.php', data, generate);
}
