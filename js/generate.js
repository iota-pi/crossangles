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
/*globals $, search, console, window, document, courseList, createClass, createShadow, classList, clearLists, restoreClasses */


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

                            // Add this stream's data to the list for this component
                            // NB: Skip web streams / classes with no class times allocated
                            if (classtime.length !== 0) {
                                // Make an entry in the hash
                                // Format = { course_code: { component: [class_time, status, enrolments, course_code, component], ... }, ...}
                                if (!hash[course].hasOwnProperty(classdata[0])) {
                                    // Initial stream list
                                    hash[course][classdata[0]] = [];
                                }

                                hash[course][classdata[0]].push({time: classtime, status: classdata[1], enrols: classdata[2], course: course, component: classdata[0]});
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
                {time: 'T 12', status: 'O', enrols: '0,1', course: 'CBS', component: 'The Bible Talks'},
                {time: 'T 13', status: 'O', enrols: '0,1', course: 'CBS', component: 'The Bible Talks'},
                {time: 'H 12', status: 'O', enrols: '0,1', course: 'CBS', component: 'The Bible Talks'},
                {time: 'H 13', status: 'O', enrols: '0,1', course: 'CBS', component: 'The Bible Talks'}
            ];
        }
        if ($('#cth').is(':checked')) {
            hash.CBS.CoreTheo = [
                {time: 'T 17', status: 'O', enrols: '0,1', course: 'CBS', component: 'Core Theology'},
                {time: 'W 13', status: 'O', enrols: '0,1', course: 'CBS', component: 'Core Theology'}
            ];
        }
        if ($('#ctr').is(':checked')) {
            hash.CBS.CoreTrain = [
                {time: 'T 16', status: 'O', enrols: '0,1', course: 'CBS', component: 'Core Training'},
                {time: 'T 18', status: 'O', enrols: '0,1', course: 'CBS', component: 'Core Training'},
                {time: 'W 12', status: 'O', enrols: '0,1', course: 'CBS', component: 'Core Training'},
                {time: 'W 14', status: 'O', enrols: '0,1', course: 'CBS', component: 'Core Training'}
            ];
        }
        if ($('#bib').is(':checked')) {
            hash.CBS.BibleStudy = [
                {time: 'M 11', status: 'O', enrols: '0,1', course: 'CBS', component: 'Bible Study'},
                {time: 'M 12', status: 'O', enrols: '0,1', course: 'CBS', component: 'Bible Study'},
                {time: 'M 13', status: 'O', enrols: '0,1', course: 'CBS', component: 'Bible Study'},
                {time: 'M 14', status: 'O', enrols: '0,1', course: 'CBS', component: 'Bible Study'},
                {time: 'T 11', status: 'O', enrols: '0,1', course: 'CBS', component: 'Bible Study'},
                {time: 'T 14', status: 'O', enrols: '0,1', course: 'CBS', component: 'Bible Study'},
                {time: 'W 11', status: 'O', enrols: '0,1', course: 'CBS', component: 'Bible Study'},
                {time: 'H 11', status: 'O', enrols: '0,1', course: 'CBS', component: 'Bible Study'},
                {time: 'H 14', status: 'O', enrols: '0,1', course: 'CBS', component: 'Bible Study'}
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
                    var times = x.time.split(','),
                        array = times.map(function (time) {
                            // Calculate start and end times
                            var classTime = time.replace(/[^\d\-.]/g, '').split('-');
                            if (classTime.length === 1) { classTime[1] = (+classTime[0]) + 1; }

                            // Format: [day, startHour, endHour]
                            return [time[0], +classTime[0], +classTime[1]];
                        });


                    // Modify first element in given array to be the new time array
                    x.time = array;

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
                    time = current.time.join(',');

                    // Update best class for this time
                    if (results.hasOwnProperty(time)) {
                        comparison = results[time];

                        if (current.status === 'O' && comparison.status !== 'O') {                          // Prioritise open streams
                            results[time] = current;
                        } else if (current.status === 'F' && comparison.status !== 'O' && comparison.status !== 'F') { // priorities full streams over others
                            results[time] = current;
                        } else {
                            a = current.enrols.split(',');
                            b = comparison.enrols.split(',');
                            if (a[1] - a[0] < b[1] - b[0]) {        // Compare enrollments, choose the one with more space remaining
                                results[time] = current;
                            }
                        }
                    } else {
                        results[time] = current;
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
            var i, j, stream;
            for (i = 0; i < list.length; i += 1) {
                stream = list[i];
                for (j = stream.length - 1; j >= 0; j -= 1) {
                    if (!$('#fullclasses').is(':checked')) {
                        if (stream[j].status !== 'O') {
                            stream.splice(j, 1);
                        }
                    } else {
                        if (stream[j].status !== 'O' && stream[j].status !== 'F') {
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

function generate(draw, pageload) {
    'use strict';
    if (draw !== false) { draw = true; }
    if (pageload !== true) { pageload = false; }

    var maxSearch = +pageload || undefined;
    function makeTimetable(list) {
        var timetable = search(list, 0, maxSearch), i, j, stream, done, courseID;
        console.log(list);

        if (!draw) { return; }
        if (timetable === null) { return; }

        // Remove all current classes
        for (i = 0; i < classList.length; i += 1) {
            classList[i].remove();
        }

        // Remove all shadows
        $('.class-shadow').remove();

        // Clear all the lists
        clearLists(pageload);

        // Add new classes
        done = [];
        for (i = 0; i < timetable.length; i += 1) {
            stream = timetable[i];
            courseID = courseList.indexOf(stream.course);
            createClass(stream.time, stream.enrols, stream.course, stream.component, courseID, done);
        }

        // Add shadows
        done = {};
        for (i = 0; i < list.length; i += 1) {
            for (j = 0; j < list[i].length; j += 1) {
                courseID = courseList.indexOf(list[i][j].course);
                createShadow(list[i][j].time, list[i][j].course + list[i][j].component, courseID, list[i][j].enrols, done);
            }
        }

        // Restore class positions from previous time (if applicable)
        if (pageload) {
            restoreClasses();
        }
    }

    fetchData(makeTimetable);
}
