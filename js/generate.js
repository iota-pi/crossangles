/* generate.js
 *
 * Steps: (note: this header comment is very out-of-date)
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
/*globals $, search, console, window, document, courseList, createClass, createShadow, classList, clearLists */


function fetchData(cb) {
    'use strict';

    var query = 'courses=' + encodeURI(JSON.stringify(courseList)),
        list = [];
    $.getJSON('data.php', query, function (r) {
        // format: r = {code: [[class_type, status, enrolments, [[class_time, class_locations], ...]], ...]}
        var hash = {};

        // Turn raw data into a hash
        (function makeHash() {
            var course, coursedata, classdata, timedata, classtime, i, j;

            // Short utility function to strip duplicate elements from an array (NB: quadratic time, should only be used on short arrays, add a hashtable for linear time)
            function uniq(arr) {
                return arr.filter(function (el, pos) {
                    return arr.indexOf(el) === pos;
                });
            }

            for (course in r) {
                // Loop through only properties which are not inherited
                if (r.hasOwnProperty(course)) {
                    hash[course] = {};

                    coursedata = r[course];
                    if (coursedata !== null) {
                        for (i = 0; i < coursedata.length; i += 1) {
                            classdata = coursedata[i];
                            timedata  = classdata[3];
                            classtime = [];
                            for (j = 0; j < timedata.length; j += 1) {
                                classtime.push(timedata[j][0]);
                            }
                            classtime = uniq(classtime);
                            classtime = classtime.join(',');

                            // Make an entry in the hash
                            // Format = { course_code: { component: [class_time, status, enrolments, course_code, component], ... }, ...}
                            if (!hash[course].hasOwnProperty(classdata[0])) {
                                // Initial stream list
                                hash[course][classdata[0]] = [];
                            }

                            // Add this stream's data to the list for this component
                            // NB: Skip web streams / classes with no class times allocated
                            if (classtime.length !== 0) {
                                hash[course][classdata[0]].push([classtime, classdata[1], classdata[2], course, classdata[0]]);
                            }
                        }
                    }
                }
            }
        }());

        // Add CBS events to list
        hash.CBS = {};
        if ($('#tbt').is(':checked')) {
            hash.CBS.TBT = [
                ['T 12', 'O', '0,1', 'CBS', 'The Bible Talks'],
                ['T 13', 'O', '0,1', 'CBS', 'The Bible Talks'],
                ['H 12', 'O', '0,1', 'CBS', 'The Bible Talks'],
                ['H 13', 'O', '0,1', 'CBS', 'The Bible Talks']
            ];
        }
        if ($('#cth').is(':checked')) {
            hash.CBS.CoreTheo = [
                ['T 17', 'O', '0,1', 'CBS', 'Core Theology'],
                ['W 13', 'O', '0,1', 'CBS', 'Core Theology']
            ];
        }
        if ($('#ctr').is(':checked')) {
            hash.CBS.CoreTrain = [
                ['T 16', 'O', '0,1', 'CBS', 'Core Training'],
                ['T 18', 'O', '0,1', 'CBS', 'Core Training'],
                ['W 12', 'O', '0,1', 'CBS', 'Core Training'],
                ['W 14', 'O', '0,1', 'CBS', 'Core Training']
            ];
        }
        if ($('#bib').is(':checked')) {
            hash.CBS.BibleStudy = [
                ['M 11', 'O', '0,1', 'CBS', 'Bible Study'],
                ['M 12', 'O', '0,1', 'CBS', 'Bible Study'],
                ['M 13', 'O', '0,1', 'CBS', 'Bible Study'],
                ['M 14', 'O', '0,1', 'CBS', 'Bible Study'],
                ['T 11', 'O', '0,1', 'CBS', 'Bible Study'],
                ['T 14', 'O', '0,1', 'CBS', 'Bible Study'],
                ['W 11', 'O', '0,1', 'CBS', 'Bible Study'],
                ['H 11', 'O', '0,1', 'CBS', 'Bible Study'],
                ['H 14', 'O', '0,1', 'CBS', 'Bible Study']
            ];
        }

        // Sort hash into a list
        (function sortHash() {
            var course, component;
            for (course in hash) {
                if (hash.hasOwnProperty(course)) {
                    for (component in hash[course]) {
                        if (hash[course].hasOwnProperty(component)) {
                            list.push([hash[course][component], hash[course][component].length]);
                        }
                    }
                }
            }
            // Order components based on # of streams for component
            list.sort(function (a, b) { return a[1] - b[1]; });
            // Remove stream-count info
            list = list.map(function (x) { return x[0]; });
            // Cast timestr to array
            list = list.map(function (stream) {
                return stream.map(function (x) {
                    var times = x[0].split(','),
                        array = times.map(function (time) {
                            // Calculate start and end times
                            var classTime = time.replace(/[^\d\-.]/g, '').split('-');
                            if (classTime.length === 1) { classTime[1] = (+classTime[0]) + 1; }

                            // Format: [day, startHour, endHour]
                            return [time[0], +classTime[0], +classTime[1]];
                        });


                    // Modify first element in given array to be the new time array
                    x[0] = array;

                    return x;
                });
            });
        }());

        // Remove extra classes with the same course, component and time, choosing to keep the one with more enrolment positions available
        // NB: this gives a huge speed improvement for backtracking search
        (function removeDuplicates() {
            var results, i, j, component, current, time, comparison, a, b;
            // Loop through each course component
            for (i = 0; i < list.length; i += 1) {
                component = list[i];
                results = {};

                // Loop through each class in the component
                for (j = 0; j < component.length; j += 1) {
                    current = component[j];
                    time = current[0];

                    // Update best class for this time
                    if (results.hasOwnProperty(time)) {
                        comparison = results[time];

                        if (current[1] === 'O' && comparison[1] !== 'O') {                          // Compare statuses
                            results[current[0]] = current;
                        } else {
                            a = current[2].split(',');
                            b = comparison[2].split(',');
                            if (a[1] - a[0] > b[1] - b[0]) {        // Compare enrollments, choose the one with more space remaining
                                results[current[0]] = current;
                            }
                        }
                    } else {
                        results[current[0]] = current;
                    }
                }

                // Overwrite list with this information
                list[i] = [];
                for (time in results) {
                    if (results.hasOwnProperty(time)) {
                        list[i].push(results[time]);
                    }
                }
            }
        }());

        // Remove full classes unless they've explicitly been been requested
        (function removeFullClasses() {
            if (!$('#fullclasses').is(':checked')) {
                var i, j, stream;
                for (i = 0; i < list.length; i += 1) {
                    stream = list[i];
                    for (j = 0; j < stream.length; j += 1) {
                        if (stream[j][1] !== 'O') {
                            stream.splice(j, 1);
                        }
                    }
                }
            }
        }());

        // Re-sort the list based on the number of streams for each component
        list.sort(function (a, b) { return a.length - b.length; });

        cb(list);
    });
}

function generate(draw) {
    'use strict';
    if (draw !== false) { draw = true; }

    fetchData(function makeTimetable(list) {
        console.log(list);
        var timetable = search(list, 0), i, j, stream, done, courseID;

        if (!draw) { return; }
        if (timetable === null) { return; }

        // Remove all current classes
        for (i = 0; i < classList.length; i += 1) {
            classList[i].remove();
        }

        // Remove all shadows
        $('.class-shadow').remove();

        clearLists();

        // Add new classes
        done = [];
        for (i = 0; i < timetable.length; i += 1) {
            stream = timetable[i];
            courseID = courseList.indexOf(stream[3]);
            createClass(stream[0], stream[2], stream[3], stream[4], courseID, done);
        }

        // Add shadows
        done = {};
        for (i = 0; i < list.length; i += 1) {
            for (j = 0; j < list[i].length; j += 1) {
                courseID = courseList.indexOf(list[i][j][3]);
                createShadow(list[i][j][0], list[i][j][3] + list[i][j][4], courseID, done);
            }
        }
    });
}

function profile() {
    'use strict';

    var n = 100,
        i;

    for (i = 0; i < n; i += 1) {
        generate(false);
    }
}
