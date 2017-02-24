/* generate.js
 *
 * Steps:
 * 1. Make a list of all class time options
 * 2. Sort list based on:
 *    - Low # of options first
 *    - Prioritise non-full classes (but keep full ones too!)
 *    - Sort on some preference of days of week (to try get off days)
 *    - Sort based on time
 *    - Class duration?
 * 3. Backtracking search
 *
 */

// Stop jslint complaining about regexs
/*jslint regexp: true */

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

    // Stable sort comparison function (only call if a and b are otherwise equal)
    // Not all js implementations of array.sort() are stable, hence this custom comparison function
    // In the sorted list, elements which were before *equal* elements in the unsorted lists will remain before them, and vice versa
    function cmp_stable(a, b) {
        return a.position - b.position;
    }

    // Heuristic function
    // NB: when doing a string of stable sorts, the lowest priority sort is done first
    //     (i.e. perform sorts in ascending priority order)
    function heuristic(list) {
        // Sort by time
        (function timesort() {
            // Time priority order for class starting at given time
            var order = [12, 13, 14, 11, 15, 16, 10, 17, 18, 19, 20, 9, 21, 22, 23, 8, 7, 6, 5, 4, 3, 2, 1, 0];
            return list.sort(function (a, b) {
                // Get all end times of classes in both stream a and b
                var timesA = a[1].replace(/[^\d\-,]/g, '').split(/[,\-]/),
                    timesB = b[1].replace(/[^\d\-,]/g, '').split(/[,\-]/),
                // The priority of a class is the lowest priority of it's end times
                // (NB: any middle will never have a lower priority than an end)
                    indexA = Math.min.apply(order.indexOf.apply(a[1].split('-'))),
                    indexB = Math.min.apply(order.indexOf.apply(b[1].split('-')));

                // Sort based on priority (index) and use original array position as a tiebreak
                return (indexA !== indexB) ? indexA - indexB : cmp_stable(a, b);
            });
        }());

        (function daysort() {
            var order = ['mon', 'tue', 'thurs', 'fri', 'wed'];
            return list.sort(function (a, b) {
                // Get the days with classes on them for both of streams a and b
                var daysA = a[1].replace(/[\d\- ]/g, '').toLowerCase().split(','),
                    daysB = b[1].replace(/[\d\- ]/g, '').toLowerCase().split(','),
                // Find the worst day and use this as the sorting priority
                    indexA = Math.min.apply(order.indexOf.apply(daysA)),
                    indexB = Math.min.apply(order.indexOf.apply(daysB));
                return (indexA !== indexB) ? indexA - indexB : cmp_stable(a, b);
            });
        }());
    }

    // Create the list of class time options
    var list = makeList();

    // Sort the list
    list.sort(heuristic);
}
