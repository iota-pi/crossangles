/* evaluate.js
 * Defines evaluation functions for scoring timetable
 */

function timetableToArray(timetableData, streams) {
    'use strict';

    var timetable = [[], [], [], [], []],
        day_of_week = ['M', 'T', 'W', 'H', 'F'],
        i,
        j,
        times,
        time,
        day,
        hour;

    // Convert to timetable array
    for (i = 0; i < timetableData.length; i += 1) {
        times = timetableData[i][0];
        for (j = 0; j < times.length; j += 1) {
            time = times[j];
            day = day_of_week.indexOf(time[0]);
            for (hour = time[1]; hour < time[2]; hour += 0.5) {
                // Initialise array element if required to blank array (this array will hold course codes for each component in this space)
                if (timetable[day][hour * 2] === undefined) {
                    timetable[day][hour * 2] = [];
                }

                // Append this course code to any previous course codes in this half-hour slot
                timetable[day][hour * 2].push(timetableData[i][3]); // element 3 is course code
            }
        }
    }

    return timetable;
}

function scoreFreeDays(timetable) {
    'use strict';
    var freeDayScores = [120, 100, 180,  100, 150],
        score = 0,
        i;

    for (i = 0; i < timetable.length; i += 1) {
        // This day is free (no classes) if the length of the array is 0
        if (timetable[i].length === 0) {
            score += freeDayScores[i];
        }
    }

    return score;
}

function scoreClashes(timetable) {
    'use strict';
    var clashScore = -500, // per half hour
        score = 0,
        i,
        j;

    for (i = 0; i < timetable.length; i += 1) {
        for (j = 0; j < timetable[i].length; j += 1) {
            // There is a clash is there is more than one element in each half-hour slot
            if (timetable[i][j].length > 1) {
                score += clashScore;
            }
        }
    }

    return score;
}

function scoreClassTime(start, end) {
    'use strict';

    // Scoring function is: -((x-14)^2 + 9)
    // All positive scores are ignored, hence from 11am-5pm, there is no differentiation
    var scoreStart = -((start - 14) * (start - 14) + 9),
        scoreEnd = -((end - 14) * (end - 14) + 9);

    // Return the worst of the start and end time score, capped at 0
    return Math.min(scoreStart, scoreEnd, 0);
}

function scoreTimes(timetable) {
    'use strict';
    var score = 0,
        i,
        j;



    return score;
}

function scoreTimetable(indexTimetable, streams) {
    'use strict';
    if (indexTimetable === null) { return null; }

    var timetableData = indexTimetable.map(function (x, i) { return streams[i][x]; }),
        timetable = timetableToArray(timetableData, streams),
        score = 0;

    score += scoreFreeDays(timetable);
    score += scoreClashes(timetable);
    score += scoreTimes(timetableData);
}

/*
function evaluateTimetable(indexTimetable, streams) {
    'use strict';

    if (indexTimetable === null) { return null; }
    var timetable = indexTimetable.map(function (x, i) { return streams[i][x]; }),
        score = 0,
        i,
        j,
        k,
        l,
        times,
        time,
        cbsDays = { M: false, T: false, W: false, H: false, F: false },
        uniDays = { M: false, T: false, W: false, H: false, F: false },
        cbsTimes = [],
        day,
        duration,
    // Scores for free days
        freeScores = { M: 120, T: 100, W: 180,  H: 100, F: 150 },
    // Scores for CBS events
        tbtClass = 100,
        coreClass = 70,
        bibleClass = 100,
    // Score for CBS event being immediately before or after another class on campus
        close2CBS = 100,
    // Score for clashes
        clash = -500;

    for (i = 0; i < timetable.length; i += 1) {
        times = timetable[i][0];

        for (j = 0; j < times.length; j += 1) {
            time = times[j];

            // Update CBS / Uni days
            if (timetable[i][3] === 'CBS') {
                cbsDays[time[0]] = true;
                cbsTimes.push(time);
            } else {
                uniDays[time[0]] = true;
            }

            // Score time of day
            score += scoreTime(time[1], time[2]);

            // Score clashes
            for (k = i + 1; k < timetable.length; k += 1) {
                for (l = 0; l < timetable[k][0].length; l += 1) {
                    if (classClash(time, timetable[k][0][l])) {
                        score += clash;
                    }
                }
            }
        }

        // Score CBS events
        if (timetable[i][4] === 'The Bible Talks') {
            score += tbtClass;
        } else if (timetable[i][4] === 'Core Theology' || timetable[i][4] === 'Core Training') {
            score += coreClass;
        } else if (timetable[i][4] === 'Bible Study') {
            score += bibleClass;
        }
    }

    // Score adjacent times next to CBS events

    // Score free days
    for (day in uniDays) {
        if (uniDays.hasOwnProperty(day)) {
            if (uniDays[day] === false && cbsDays[day] === false) {
                score += freeScores[day];
            }
        }
    }

    return score;
}
*/
