/* generate.js
 *
 * Steps: (note: this header comment is very out-of-date)
 * 1. Make a list of all class time options
 * 2. Evolutionary algorithm based on backtracking search to find best timetable (see search.js)
 * 3. Draws generated timetable
 *
 * Authors: David
 */

// Stop jslint complaining about regexs
/*jslint regexp: true */
/*globals $, search, console, window, document, timetableData, courseList, createClass, createShadow, classList, clearLists, restoreClasses, saveState, showEmpty, hideEmpty */


function fetchData(cb) {
    'use strict';

    //query = 'courses=' + encodeURI(JSON.stringify(courseList)),
    var list = [],
    // TODO: use timetableData
    //$.getJSON('data.php', query, function (r) {
        // format: r = {code: [[class_type, status, enrolments, [[class_time, class_locations], ...]], ...]}
        hash = {},
        data = {},
        i;
    for (i = 0; i < courseList.length; i += 1) {
        if (courseList[i] !== 'CBS') {
            data[courseList[i]] = timetableData[courseList[i]].slice(1);
        }
    }

    // Turn raw data into a hash
    (function makeHash() {
        var course, coursedata, classdata, timedata, classtime, locations, i, j;

        // Short utility function to strip duplicate elements from an array (NB: quadratic time, should only be used on short arrays, add a hashtable for linear time)
        function uniq(arr) {
            return arr.filter(function (el, pos) {
                return arr.map(String).indexOf(String(el)) === pos;
            });
        }

        for (course in data) {
            // Loop through only properties which are not inherited
            if (data.hasOwnProperty(course)) {
                hash[course] = {};

                coursedata = data[course];
                if (coursedata !== null) {
                    for (i = 0; i < coursedata.length; i += 1) {
                        classdata = coursedata[i];
                        timedata  = classdata[3];
                        timedata  = uniq(timedata);
                        classtime = [];
                        locations = [];
                        for (j = 0; j < timedata.length; j += 1) {
                            classtime.push(timedata[j][0]);
                            locations.push(timedata[j][1]);
                        }
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

                            hash[course][classdata[0]].push({time: classtime, status: classdata[1], enrols: classdata[2], course: course, component: classdata[0], location: locations});
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
            {time: 'T 12', status: 'O', enrols: '0,1', course: 'CBS', component: 'The Bible Talks', location: ['Elec Eng 418']},
            {time: 'T 13', status: 'O', enrols: '0,1', course: 'CBS', component: 'The Bible Talks', location: ['Elec Eng 418']},
            {time: 'H 12', status: 'O', enrols: '0,1', course: 'CBS', component: 'The Bible Talks', location: ['Rup Myers Theatre']},
            {time: 'H 13', status: 'O', enrols: '0,1', course: 'CBS', component: 'The Bible Talks', location: ['Rup Myers Theatre']}
        ];
    }
    if ($('#cth').is(':checked')) {
        hash.CBS.CoreTheo = [
            {time: 'T 17', status: 'O', enrols: '0,1', course: 'CBS', component: 'Core Theology', location: ['Colombo C']},
            {time: 'W 13', status: 'O', enrols: '0,1', course: 'CBS', component: 'Core Theology', location: ['CLB 4']}
        ];
    }
    if ($('#ctr').is(':checked')) {
        hash.CBS.CoreTrain = [
            {time: 'T 16', status: 'O', enrols: '0,1', course: 'CBS', component: 'Core Training', location: ['Quad Sundial']},
            {time: 'T 18', status: 'O', enrols: '0,1', course: 'CBS', component: 'Core Training', location: ['Quad Sundial']},
            {time: 'W 12', status: 'O', enrols: '0,1', course: 'CBS', component: 'Core Training', location: ['Quad Sundial']},
            {time: 'W 14', status: 'O', enrols: '0,1', course: 'CBS', component: 'Core Training', location: ['Quad Sundial']}
        ];
    }
    if ($('#bib').is(':checked')) {
        hash.CBS.BibleStudy = [
            {time: 'M 11', status: 'O', enrols: '0,1', course: 'CBS', component: 'Bible Study', location: ['Quad Sundial']},
            {time: 'M 12', status: 'O', enrols: '0,1', course: 'CBS', component: 'Bible Study', location: ['Quad Sundial']},
            {time: 'M 13', status: 'O', enrols: '0,1', course: 'CBS', component: 'Bible Study', location: ['Quad Sundial']},
            {time: 'M 14', status: 'O', enrols: '0,1', course: 'CBS', component: 'Bible Study', location: ['Quad Sundial']},
            {time: 'T 11', status: 'O', enrols: '0,1', course: 'CBS', component: 'Bible Study', location: ['Quad Sundial']},
            {time: 'T 14', status: 'O', enrols: '0,1', course: 'CBS', component: 'Bible Study', location: ['Quad Sundial']},
            {time: 'W 11', status: 'O', enrols: '0,1', course: 'CBS', component: 'Bible Study', location: ['Quad Sundial']},
            {time: 'H 11', status: 'O', enrols: '0,1', course: 'CBS', component: 'Bible Study', location: ['Quad Sundial']},
            {time: 'H 14', status: 'O', enrols: '0,1', course: 'CBS', component: 'Bible Study', location: ['Quad Sundial']}
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
                        // Calculate start and end times and check if clash approved
                        var canClash = time.indexOf('#') !== -1,
                            classTime = time.replace(/[^\d\-.]/g, '').split('-');
                        if (classTime.length === 1) { classTime[1] = (+classTime[0]) + 1; }

                        // Format: [day, startHour, endHour, canClash]
                        return [time[0], +classTime[0], +classTime[1], canClash];
                    });

                // Modify first element in given array to be the new time array
                x.time = array;

                return x;
            });
        });
    }());

    (function removeBadDays() {
        list = list.map(function (stream) {
            return stream.filter(function (x) {
                var times = x.time,
                    days = 'MTWHF',
                    i;
                for (i = 0; i < times.length; i += 1) {
                    if (days.indexOf(times[i][0]) === -1) {
                        return false;   // remove any item containing an invalid day in one of its times
                    }
                }

                return true;
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
}

function generate(draw, pageload) {
    'use strict';
    if (draw !== false) { draw = true; }
    if (pageload !== true) { pageload = false; }
    var maxSearch = (pageload) ? 0 : undefined, // if pageload is false, value will be undefined = use default, otherwise, max iterations for search will be 0 to prevent search
        maxClash  = +(document.getElementById('canclash').checked) * 100;

    function makeTimetable(list) {
        var timetable = search(list, maxClash, maxSearch), i, j, stream, done, courseID, y, minY, maxY;

        if (!draw) { return; }
        if (timetable === null) { return; }

        minY = Infinity;
        maxY = -Infinity;

        // Remove all current classes
        for (i = 0; i < classList.length; i += 1) {
            classList[i].remove();
        }

        // Remove all shadows
        $('.class-shadow').remove();

        // Clear all the lists
        clearLists(pageload);

        // Show all timetable rows
        showEmpty();

        // Add new classes
        done = [];
        for (i = 0; i < timetable.length; i += 1) {
            stream = timetable[i];
            courseID = courseList.indexOf(stream.course);
            createClass(stream, courseID, done);
        }

        // Add shadows
        done = {};
        for (i = 0; i < list.length; i += 1) {
            for (j = 0; j < list[i].length; j += 1) {
                courseID = courseList.indexOf(list[i][j].course);
                y = createShadow(list[i][j], courseID, done);
                minY = Math.min(minY, y.min);
                maxY = Math.max(maxY, y.max);
            }
        }

        // Restore class positions from previous time (if applicable)
        if (pageload) {
            restoreClasses();
        } else {
            saveState();
        }

        hideEmpty(Math.floor(minY), Math.floor(maxY));
    }

    fetchData(makeTimetable);
}
