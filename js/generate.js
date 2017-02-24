/* generate.js
 *
 * Steps:
 * 1. Make a list of all class time options
 * 2. Sort list based on:
 *    - Prioritise non-full classes (but keep full ones too!)
 *    - Low # of options first
 *    - Sort on some preference of days of week (to try get off days)
 *    - Sort based on time
 *    - Class duration?
 * 3. Backtracking search
 *
 */

// Stop jslint complaining about regexs
/*jslint regexp: true */
/*globals console */

function generateTimetable(data) {
    // data = {code: [[class_type, status, enrolments, [[class_time, class_weeks, class_locations], ...]], ...]}
    'use strict';

    function makeList(data) {
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
                    list.push([coursecode, classtime, coursedata[0], coursedata[1], coursedata[2]]);
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
            dayorder = ['mon', 'tue', 'thurs', 'fri', 'wed'],
        // Variable initialisation for option counting
            optCount = {},
            i,
            key,
            stream;

        // Count # of options in each stream
        for (i = 0; i < list.length; i += 1) {
            stream = list[i];

            // Use course code and course component as the key for the hash
            key = stream[0] + stream[2];
            if (optCount.hasOwnProperty(key)) {
                optCount[key] += 1;
            } else {
                optCount[key] = 1;
            }
        }

        // Sort by best time
        function timesort(a, b) {
            // Get all end times of classes in both stream a and b
            var timesA = a.key[1].replace(/[^\d\-,]/g, '').split(/[,\-]/),
                timesB = b.key[1].replace(/[^\d\-,]/g, '').split(/[,\-]/),
            // The priority of a class is the lowest priority of it's end times
            // (NB: any middle will never have a lower priority than an end)
                indexA = Math.min.apply(timeorder.indexOf.apply(a.key[1].split('-'))),
                indexB = Math.min.apply(timeorder.indexOf.apply(b.key[1].split('-')));

            // Sort based on priority (index in timeorder)
            return indexA - indexB;
        }

        // Sort by best days
        function daysort(a, b) {
            // Get the days with classes on them for both of streams a and b
            var daysA = a.key[1].replace(/[\d\- ]/g, '').toLowerCase().split(','),
                daysB = b.key[1].replace(/[\d\- ]/g, '').toLowerCase().split(','),
            // Find the worst day and use this as the sorting priority
                indexA = Math.min.apply(dayorder.indexOf.apply(daysA)),
                indexB = Math.min.apply(dayorder.indexOf.apply(daysB));
            return indexA - indexB;
        }

        // Sort by limitations
        function limits(a, b) {
            // Sort based on # of options
            return list.sort(function (a, b) {
                var optsA = optCount[a.key[0] + a.key[2]],
                    optsB = optCount[b.key[0] + b.key[2]];
                return optsA - optsB;
            });
        }

        // Sort by non-full classes
        function nonfull(a, b) {
            // Sort based on priority (index) and use original array position as a tiebreak
            return (a.key[3] === b.key[3]) ? 0 : ((a.key[3] === 'full') ? 1 : -1);
        }
    }

    // Sort the list
    list.sort(heuristic);
}
