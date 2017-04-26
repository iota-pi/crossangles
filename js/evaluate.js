/* evaluate.js
 * Defines evaluation functions for scoring timetable
 */

/*globals console */

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
                // Initialise array element (if required) to blank array (this array will hold course codes for each component in this space)
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

function scoreClashes(timetable, timetableData) {
    'use strict';
    var clashScore = -500, // per half hour
        score = 0,
        i,
        j;

    for (i = 0; i < timetable.length; i += 1) {
        for (j = 0; j < timetable[i].length; j += 1) {
            if (timetable[i][j] !== undefined) {
                // There is a clash is there is more than one element in each half-hour slot
                if (timetable[i][j].length > 1) {
                    score += clashScore;
                }
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

function scoreTimes(timetableData) {
    'use strict';
    var score = 0,
        i,
        j,
        times;

    for (i = 0; i < timetableData.length; i += 1) {
        times = timetableData[i][0];
        for (j = 0; j < times.length; j += 1) {
            score += scoreClassTime(times[j][1], times[j][2]);
        }
    }

    return score;
}

function scoreProximity(timetable) {
    'use strict';

    // NB: the way that this scoring is done, since CBS events are 2 half-hours long,
    // they will each automatically be given 2*adjacentScore points from this function
    var adjacentScore = 50,
        score = 0,
        i,
        j;

    for (i = 0; i < timetable.length; i += 1) {
        for (j = 0; j < timetable[i].length; j += 1) {
            if (timetable[i][j] !== undefined) {
                if (timetable[i][j].indexOf('CBS') !== -1) {
                    // Check previous half hour
                    if (timetable[i][j - 1] !== undefined) {
                        score += adjacentScore;
                    }
                    // Check next half hour
                    if (timetable[i][j + 1] !== undefined) {
                        score += adjacentScore;
                    }
                }
            }
        }
    }

    return score;
}

function scoreTimetable(indexTimetable, streams) {
    'use strict';
    if (indexTimetable === null) { return null; }

    var timetableData = indexTimetable.map(function (x, i) { return streams[i][x]; }),
        timetable = timetableToArray(timetableData, streams),
        score = 0;

    score += scoreFreeDays(timetable);
    score += scoreClashes(timetable, timetableData);
    score += scoreTimes(timetableData);
    score += scoreProximity(timetable);

    return score;
}
