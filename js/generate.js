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

    // Heuristic function
    function heuristic() {

    }

    // Create the list of class time options
    var list = makeList();

    // Sort the list
    list.sort(heuristic);
}
