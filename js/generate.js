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
/*globals $, search, console, document, courseList, createClass, createShadow, classList, clearLists */


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

        // Remove extra classes with the same course, component and time
        // NB: this gives a huge speed improvement for backtracking search
        (function removeDuplicates() {
            var results, i, j, component, current, time, comparison;
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
                        } else if (current[2].split(',')[0] > comparison[2].split(',')[0]) {        // Compare enrollments
                            results[current[0]] = current;
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

        cb(list);
    });
}

function generate() {
    'use strict';

    /*
    // Checks whether two given time strings clash with each other
    function classClash(a, b) {
        // If days are different, then there is clearly no clash
        if (a[0] !== b[0]) { return false; }

        // If the lower of one is bigger than the higher of the other, then there is no overlap
        // NB: if a[0] === a[1], then this is not always true; hence the extra "a[0] > b[0]" condition
        if (a[1] >= b[2] || b[1] >= a[2]) {
            return false;
        }

        return true;
    }

    // Checks to see if the given time string clashes with any other time string in the timetable
    function checkClash(list, timetable, time) {
        var i, j, k, stream, times;
        for (i = 0; i < time.length; i += 1) {
            for (j = 0; j < timetable.length; j += 1) {
                stream = list[j][timetable[j]];
                times = stream[0];
                for (k = 0; k < times.length; k += 1) {
                    if (classClash(time[i], times[k])) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    function dfs(list, maxClash) {
        var timetable = [],
            ttFull,
            score,
            best = {timetable: null, score: null},
            i = 0,
            component,
            classIndex,
            time,
            clashes = 0;

        function rollback() {
            // Remove this item from timetable (if it has already been set)
            if (i < timetable.length) {
                timetable.pop();
            }

            // Roll back
            i -= 1;
            if (i < 0) {
                if (best.timetable === null) {
                    console.error('No timetable could be generated');
                    console.error('Try again with more clash hours');
                }
                return false;
            }

            return true;
        }

        function mapTimetable() {
            return timetable.map(function (x, i) { return list[i][x]; });
        }

        while (i < list.length) {
            component = list[i];

            // Find a class for this component which doesn't clash
            // NB: in the case of rollback to this component, start checking for clashes from the current value; otherwise start at 0
            classIndex = timetable[i] || 0;
            while (classIndex < component.length) {
                time = component[classIndex][0];
                if (checkClash(list, timetable, time)) {
                    classIndex += 1;
                } else {
                    break;
                }
            }

            if (classIndex < component.length) {
                // Set this class in the timetable
                timetable[i] = classIndex;

                // Step forward
                i += 1;

                // Check if we've finished creating a valid timetable
                if (i === list.length) {
                    // Score this timetable
                    ttFull = mapTimetable();
                    score = evaluateTimetable(ttFull);

                    // Update record of best timetable
                    if (score > best.score) {
                        best.timetable = ttFull;
                        best.score = score;
                    }

                    // Try to find another one
                    rollback();
                }
            } else {
                // --- Component couldn't be satisfied --- //
                if (!rollback()) {
                    // Stop, no more timetables to generate
                    break;
                }
            }
        }

        // Change timetable from holding indexes to holding the actual data
        return best.timetable;
    }

    function search(list, maxclash) {
        var table = [],
            indexList,
            i;
        function dfs(indexList, level) {
            if (level === undefined) { level = 0; }

            var len = indexList.length - level,
                temp = { timetable: null, score: null },
                best = { timetable: null, score: null },
                results = [],
                reduced,
                i,
                j;
            console.log(level, len);

            // Check if we've already hashed this
            if (len < table.length) {
                if (table.hasOwnProperty(indexList)) {
                    return table[len][indexList];
                }
            } else {
                table[len] = {};
            }

            if (len === 1) {
                // Base case: optimal timetable is just the single class
                temp.timetable = [indexList[level]];
                temp.score = evaluateTimetable(temp.timetable);
                results = [temp];
            } else {
                // Continue recursion
                reduced = dfs(indexList, level + 1);
                console.log(reduced, level + 1);

                for (i = 0; i < reduced.length; i += 1) {
                    for (j = 0; j < indexList[level].length; j += 1) {
                        temp.timetable = indexList[level][j] + reduced[i].timetable;
                        temp.score = evaluateTimetable(temp.timetable);

                        if (temp.score > best.score) {
                            best.timetable = temp.timetable;
                            best.score = temp.score;
                        }
                    }

                    results.push($.extend({}, best));
                }
            }

            console.log(table);
            table[len][indexList] = results;
            return results;
        }

        indexList = [];
        function toIndex(x, i) { return i; }
        for (i = 0; i < list.length; i += 1) {
            indexList[i] = list[i].map(toIndex);
        }

        dfs(indexList);

        return [];
    }
    */

    fetchData(function makeTimetable(list) {
        var timetable = search(list, 0), i, j, stream, done, courseID;

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
            createClass(stream[0], stream[3], stream[4], courseID, done);
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
