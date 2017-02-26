/* generate.js
 *
 * Steps:
 * 1. Make a list of all class time options
 * 2. Sort list based on:
 *   1- Prioritise non-full classes (but keep full ones too!)
 *   2- Low # of options first
 *   3- Sort based on time
 *   4- Sort on some preference of days of week (to try get off days)
 *   5- Class duration?
 * 3. Backtracking search
 *
 * NB: Step 2 (low # of options) could be de-prioritised for possibly slower generation, but nicer timetables
 *     (since it is purely a performance heuristic, rather than a timetable enchancement)
 *
 */

// Stop jslint complaining about regexs
/*jslint regexp: true */
/*globals $, console, getCourses */

function generate(data) {
    // data = {code: [[class_type, status, enrolments, [[class_time, class_locations], ...]], ...]}
    'use strict';

    function makeList() {
        var list = [], coursecode, coursedata, classdata, timedata, classtime, i, j;

        for (coursecode in data) {
            // Loop through only properties which are not inherited
            if (data.hasOwnProperty(coursecode)) {
                coursedata = data[coursecode];
                for (i = 0; i < coursedata.length; i += 1) {
                    classdata = coursedata[i];
                    timedata  = classdata[3];
                    classtime = [];
                    for (j = 0; j < timedata.length; j += 1) {
                        classtime.push(timedata[j][0]);
                    }
                    classtime = classtime.join(',');

                    // Make an entry in the list
                    // Format = [course_code, class_time, class_type, status, enrolments]
                    list.push([coursecode, classtime, classdata[0], classdata[1], classdata[2]]);
                }
            }
        }

        return list;
    }

    /*
    // Stable sort comparison function (only call if a and b are otherwise equal)
    // Not all js implementations of array.sort() are stable, hence this custom comparison function
    // In the sorted list, elements which were before *equal* elements in the unsorted lists will remain before them, and vice versa
    function cmp_stable(a, b) {
        return a.position - b.position;
    }
    */

    // Create the list of class time options
    var list = makeList();

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

        // Count # of options in each stream
        for (i = 0; i < list.length; i += 1) {
            // Use course code and course component as the key for the hash
            key = list[i][0] + list[i][2];
            if (optCount.hasOwnProperty(key)) {
                optCount[key] += 1;
            } else {
                optCount[key] = 1;
            }
        }

        // Sort by best time
        function timesort(a, b) {
            // Get all end times of classes in both stream a and b
            var timesA = a[1].replace(/[^\d\-,]/g, '').split(/[,\-]/).map(function (x) { return +x; }),
                timesB = b[1].replace(/[^\d\-,]/g, '').split(/[,\-]/).map(function (x) { return +x; }),
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
            var daysA = a[1].replace(/[\d\- ]/g, '').split(','),
                daysB = b[1].replace(/[\d\- ]/g, '').split(','),
            // Find the worst day and use this as the sorting priority
                index = function (x) { return dayorder.indexOf(x); },
                indexA = Math.max.apply(null, daysA.map(index)),
                indexB = Math.max.apply(null, daysB.map(index));

            return indexA - indexB;
        }

        // Sort by limitations
        function limits(a, b) {
            var optsA = optCount[a[0] + a[2]],
                optsB = optCount[b[0] + b[2]];
            return optsA - optsB;
        }

        // Sort by non-full classes
        function nonfull(a, b) {
            // Sort based on priority (index) and use original array position as a tiebreak
            return (a[3] === b[3]) ? 0 : ((a[3] === 'O') ? -1 : 1);
        }

        // Apply the heuristic sorting functions in order
        result = 0;
        fnOrder = [nonfull, limits, timesort, daysort];
        while (result === 0) {
            // Use the next heuristic function
            result = (fnOrder.shift())(a, b);

            // No more ordering heuristics
            if (fnOrder.length === 0) { break; }
        }

        return result;
    }

    // Sort the list
    list.sort(heuristic);

    // Do backtracking search

}

function generateTimetable() {
    'use strict';

    var data = 'courses=' + encodeURI(JSON.stringify(getCourses()));
    $.getJSON('data.php', data, generate);
}
