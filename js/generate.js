/* generate.js
 *
 * Contrary to what the name implies, this file does not perform any of the logic for generating a timetable.
 * What it does do is parse the data loaded from timetable.json and create the DOM elements (classes and class shadows) as per generated timetable
 * For the actual generation algorithm, see search.js
 *
 * Authors: David
 */

// Stop jslint complaining about regexs
/*jslint regexp: true */
/*globals $, search, document, timetableData, components_index, locations_index, times_index, courseList, customClasses, createClass, createShadow, classList, clearLists, restoreClasses, saveState, showEmpty, hideEmpty, pageError, pageNotice, CBS, console */

function fetchData(cb) {
    'use strict';

    var list = [],
        hash = {},
        data = {},
        i;
    for (i = 0; i < courseList.length; i += 1) {
        if (courseList[i] !== 'CBS' && timetableData.hasOwnProperty(courseList[i])) {
            data[courseList[i]] = timetableData[courseList[i]].slice(1);
        }
    }

    // Turn raw data into a hash
    (function makeHash() {
        var course, courseData, classData, classTime, locations, i, j;

        for (course in data) {
            // Loop through only properties which are not inherited
            if (data.hasOwnProperty(course)) {
                hash[course] = {};

                courseData = data[course];
                if (courseData !== null) {
                    for (i = 0; i < courseData.length; i += 1) {
                        classData = courseData[i];
                        classTime = [];
                        locations = [];
                        for (j = 4; j < classData.length; j += 2) {
                            // Construct a list of unique times (and corresponding locations)
                            if (classTime.indexOf(classData[j]) === -1) {
                                classTime.push(times_index[classData[j]]);
                                locations.push(locations_index[classData[j + 1]]); // also de-index locations
                            }
                        }
                        classTime = classTime.join(',');

                        // Add this stream's data to the list for this component
                        // NB: Skip web streams / classes with no class times allocated
                        if (classTime.length !== 0) {
                            // Make an entry in the hash
                            // Format = { course_code: { component: [class_time, status, enrolments, course_code, component], ... }, ...}
                            if (!hash[course].hasOwnProperty(classData[0])) {
                                // Initial stream list
                                hash[course][classData[0]] = [];
                            }

                            // Change status integer into a letter with more meaning
                            var classStatus = ['O', 'F', 'C', 'S', 'T', 'c'][classData[1]];

                            // Change component index to three-letter abbreviation
                            var classComponent = components_index[classData[0]];

                            hash[course][classData[0]].push({time: classTime, status: classStatus, enrols: classData[2] + ',' + classData[3], course: course, component: classComponent, location: locations});
                        }
                    }
                }
            }
        }
    }());

    // Add CBS events to list
    hash.CBS = {};
    if ($('#tbt').is(':checked')) {
        hash.CBS.TBT = JSON.parse(JSON.stringify(CBS.TBT));
    }
    if ($('#cth').is(':checked')) {
        hash.CBS.CoreTheo = JSON.parse(JSON.stringify(CBS.CoreTheo));
    }
    if ($('#ctr').is(':checked')) {
        hash.CBS.CoreTrain = JSON.parse(JSON.stringify(CBS.CoreTrain));
    }
    if ($('#bib').is(':checked')) {
        hash.CBS.BibleStudy = JSON.parse(JSON.stringify(CBS.BibleStudy));
    }

    // Add custom events
    for (i = 0; i < customClasses.length; i += 1) {
        var obj = {};
        for (var prop in customClasses[i]) {
            if (customClasses[i].hasOwnProperty(prop)) {
                obj[prop] = customClasses[i][prop];
            }
        }
        hash[obj.course] = {};
        hash[obj.course][obj.component] = [obj];
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

    // Re-sort the list based on the number of streams for each component
    list.sort(function (a, b) { return a.length - b.length; });

    cb(list);
}

function generate(draw, pageload) {
    'use strict';
    if (draw !== false) { draw = true; }
    if (pageload !== true) { pageload = false; }

    if (draw === true) { $('#timetable').addClass('loading'); }

    var maxSearch = (pageload) ? 0 : undefined, // if pageload is false, value will be undefined (= use default), otherwise, max iterations will be set to 0 to prevent search
        maxClash  = 0,
        allowFull = document.getElementById('fullclasses').checked;

    function makeTimetable(list) {
        var timetable = search(list, maxClash, maxSearch, allowFull);
        var i, j, stream, done, courseID;

        if (!draw) { return; }
        if (timetable === null) {
            pageError('Sorry about that!', 'We weren\'t able to create a timetable for you. Maybe try again with different courses, or including full classes.');
            $('#timetable').removeClass('loading');
            return;
        }

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
        var minY = Infinity,
            maxY = -Infinity,
            y;
        for (i = 0; i < list.length; i += 1) {
            for (j = 0; j < list[i].length; j += 1) {
                courseID = courseList.indexOf(list[i][j].course);
                y = createShadow(list[i][j], courseID);
                minY = Math.min(minY, y.min);
                maxY = Math.max(maxY, y.max);
            }
        }

        // Restore class positions from previous time (if applicable)
        if (pageload) {
            restoreClasses();
        } else {
            saveState(); // save state information (including generation-specific details)
        }

        // Hide empty rows (unless all rows are empty)
        if (minY !== Infinity) {
            hideEmpty(Math.floor(minY), Math.floor(maxY));
        }

        $('#timetable').removeClass('loading');
    }

    fetchData(makeTimetable);
}
