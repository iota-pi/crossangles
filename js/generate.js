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
/*globals $, console, courseList, createClass, createShadow, classList, clearLists */

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

        cb(list);
    });
}

function generate() {
    'use strict';

    // Timetable scoring function
    function evaluateTimetable(timetable) {
        // Scores for free days
        var freeScores = {'M': 120, 'T': 100, 'W': 180,  'H': 100, 'F': 150},
            freeDays = {'M': false, 'T': false, 'W': false, 'H': false, 'F': false},
        // Scores for times of day
            pre10 = -30,        // (i.e. startHour <= 9am)
            post5 = -30,        // (i.e. endHour    > 5pm)
            post7 = -50,        // NB: Additional to post5
        // Score for TBT (double for on same day as a class)
            tbtClass = 150,
        // Score for CORE (double for on same day as a class)
            coreClass = 100,
        // Score for Bible Study (double for on same day as a class)
            bibleClass = 150,
        // Score for CBS event being immediately before or after another class on campus
            close2CBS = 100,
        // Define score variable
            score = 0;

        // --- Score free days --- //
        (function () {
            var days = timetable.map(function (obj) { return obj[0][0]; }),
                classDays = days.join(''),
                day;
            for (day in freeScores) {
                if (freeScores.hasOwnProperty(day)) {
                    if (classDays.indexOf(day) === -1) {
                        score += freeScores[day];
                        freeDays[day] = true;
                    }
                }
            }

            return score;
        }());

        // --- Score times of day --- //
        (function () {
            var time, i;
            for (i = 0; i < timetable.length; i += 1) {
                time = timetable[i][0];
                if (time[1] < 10) {
                    score += pre10;
                }
                if (time[2] > 17) {
                    score += post5;
                }
                if (time[2] > 19) {
                    score += post7;
                }
            }
            return score;
        }());

        // --- Score TBT and CORE days --- //
        (function () {
            var i,
                tbtDay,
                coreThDay,
                coreTrDay,
                bibleDay;
            for (i = 0; i < timetable.length; i += 1) {
                // Check if this is a Bible Talk
                if (timetable[i][4] === 'The Bible Talks') {
                    tbtDay = timetable[i][0][0];
                }

                if (timetable[i][4] === 'Core Theology') {
                    coreThDay = timetable[i][0][0];
                }

                if (timetable[i][4] === 'Core Training') {
                    coreTrDay = timetable[i][0][0];
                }

                if (timetable[i][4] === 'Bible Study') {
                    bibleDay = timetable[i][0][0];
                }
            }

            // Add the scores for each event which isn't on a free day
            if (tbtDay) { score += (1 + !freeDays[tbtDay]) * tbtClass; }
            if (coreThDay) { score += (1 + !freeDays[coreThDay]) * coreClass; }
            if (coreTrDay) { score += (1 + !freeDays[coreTrDay]) * coreClass; }
            if (bibleDay) { score += (1 + !freeDays[bibleDay]) * bibleClass; }
        }());

        // --- Score CBS event timing --- //
        (function () {
            var i,
                j,
                cbsTime,
                uniTime;
            for (i = 0; i < timetable.length; i += 1) {
                // Check if this is a CBS event
                if (timetable[i][3] === 'CBS') {
                    cbsTime = timetable[i][0];
                    for (j = 0; j < timetable.length; j += 1) {
                        // Check if this is a uni class
                        if (timetable[j][3] !== 'CBS') {
                            uniTime = timetable[j][0];
                            // Check days match up
                            if (cbsTime[0] === uniTime[1]) {
                                // Check ending/starting time overlap
                                if (cbsTime[1] === uniTime[2] || cbsTime[2] === uniTime[1]) {
                                    score += close2CBS;
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }());

        return score;
    }

    /**
    * Randomize array element order in-place.
    * Using Durstenfeld shuffle algorithm.
    */
    function shuffleArray(array) {
        var i, j, temp;
        for (i = array.length - 1; i > 0; i -= 1) {
            j = Math.floor(Math.random() * (i + 1));
            temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }

    fetchData(function (list) {
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
        function checkClash(classList, timetable, time) {
            var i, j, k, stream, times;
            for (i = 0; i < time.length; i += 1) {
                for (j = 0; j < timetable.length; j += 1) {
                    stream = classList[j][timetable[j]];
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

        // Backtracking (depth-first) search
        function dfs(classList) {
            var timetable = [],
                i = 0,
                component,
                index;

            // Do backtracking search
            while (i < classList.length) {
                component = classList[i];

                // Choose the first non-clashing stream
                index = (timetable[i] + 1) || 0;
                while (index < component.length && checkClash(classList, timetable, component[index][0])) {
                    index += 1;
                }

                // Check if we should backtrack or continue
                if (index === component.length) {
                    // Remove this item from the timetable
                    timetable[i] = 0; // NB: set it first, in case it hasn't been set yet
                    timetable.pop();

                    // Step backwards
                    i -= 1;

                    // Impossibility Check
                    if (i < 0) {
                        return null;
                    }
                } else { // Continue
                    timetable[i] = index;

                    // Step forwards
                    i += 1;
                }
            }

            return timetable.map(function (x, i) { return classList[i][x]; });
        }

        function search(maxTries) {
            maxTries = (maxTries !== undefined) ? maxTries : 1000;
            var i,
                j,
                best = { score: -Infinity, timetable: [] },
                result,
                score,
                shuffledList;
            for (i = 0; i < maxTries; i += 1) {
                // Shuffle list
                shuffledList = list.slice();
                for (j = 0; j < shuffledList.length; j += 1) {
                    shuffleArray(shuffledList[j]);
                }

                // Call dfs search function
                result = dfs(shuffledList);

                // Check if there was a problem generating the timetable
                if (result === null) {
                    // Serious problem if we couldn't generate any timetable
                    if (i === 0) {
                        console.error('Could not generate timetable! Some clashes could not be resolved.');
                    }

                    break;
                }

                // Score this timetable
                score = evaluateTimetable(result);

                // Compare this score to the previous best
                if (score > best.score) {
                    best.score = score;
                    best.timetable = result;
                }
            }

            return best.timetable;
        }

        var timetable = search(), i, j, stream, done, courseID;

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
