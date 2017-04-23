/* search.js
 *
 * Defines search algorithm to use for finding best timetable as well as evaluation function for timetables
 */

/*globals console */

function scoreTime(start, end) {
    'use strict';

    var score = 4 - Math.abs(14.5 - (start + end) / 2);
    score *= Math.abs(score);
    score *= (end - start);

    return score;
}

// Checks whether two given time strings clash with each other
// TODO: switch clash counting from # of clashing classes to # of clash hours
function classClash(a, b) {
    'use strict';

    // If days are different, then there is clearly no clash
    if (a[0] !== b[0]) { return false; }

    // Iff the start of one is later than the end of the other, then there is no overlap
    if (a[1] >= b[2] || b[1] >= a[2]) {
        return false;
    }

    return true;
}

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
        tbtClass = 150,
        coreClass = 100,
        bibleClass = 150,
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
            for (k = i; k < timetable.length; k += 1) {
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

    for (day in uniDays) {
        if (uniDays.hasOwnProperty(day)) {
            // Score free days
            if (uniDays[day] === false && cbsDays[day] === false) {
                score += freeScores[day];
            }
        }
    }

    return score;
}

function search(list, maxClash) {
    'use strict';

    // Checks whether two given time strings clash with each other
    function countClashes(streams, timetable, newTime) {
        var i, j, k, stream, times, count = 0;
        for (i = 0; i < newTime.length; i += 1) {
            for (j = 0; j < timetable.length; j += 1) {
                stream = streams[j][timetable[j]];
                times = stream[0];
                for (k = 0; k < times.length; k += 1) {
                    if (classClash(newTime[i], times[k])) {
                        count += 1;
                        if (count > maxClash) {
                            return count;
                        }
                    }
                }
            }
        }

        return count;
    }

    // Chooses a class which doesn't cause too many clashes
    // Inherited variables: maxClash
    function pickClass(streams, i, timetable) {
        var classNo = timetable[i] || 0,        // If we have rolled back to this point, continue from where we were up to
            stream = streams[i];

        // Keep looking for a class while there is a clash
        while (classNo < stream.length && countClashes(streams, timetable, stream[classNo]) > maxClash) {
            classNo += 1;
        }

        // Check for no valid solution
        if (classNo === stream.length) {
            return null;
        }

        return classNo;
    }

    // Perform a depth-first search to try find a valid timetable
    function dfs(streams, init_timetable, init_index) {
        var i = init_index || 0,
            stream,
            classNo,
            timetable = init_timetable || [];

        while (i < streams.length) {
            stream = streams[i];

            // Pick first class for this steam that doesn't have a clash
            classNo = pickClass(streams, i, timetable);

            // Roll back if all classes in stream cause a clash
            if (classNo === null) {
                // Remove this item from timetable (if it has already been set)
                if (i < timetable.length) {
                    timetable.pop();
                }

                // Step back to previous stream
                i -= 1;

                // Check if we've rolled all the way back past the start (i.e. timetable impossible to generate)
                if (i < 0) {
                    return null;
                }
            } else {
                // Record chosen class for this stream in timetable
                timetable[i] = classNo;

                // Move on to next stream
                i += 1;
            }
        }

        // At this point, valid timetable has successfully been found
        return timetable;
    }

    // Randomize array element order in-place (using Durstenfeld shuffle algorithm)
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

    // Mutates a parent solution to produce a child solution
    function mutate(parent) {
        var child = { classes: [], timetable: null, score: null },
            i,
            j;
        for (i = 0; i < parent.classes.length; i += 1) {
            child.classes.push(parent.classes[i]);
        }

        while (child.timetable === null) {
            j = Math.floor(Math.random() * parent.length);
            child.classes[j] = shuffleArray(child.classes[j]);
            child.timetable = dfs(child.classes, parent.timetable, j);
        }

        child.score = evaluateTimetable(child.timetable, child.classes);

        return child;
    }

    function parentSort(a, b) {
        return b.score - a.score;
    }

    // Evolves given list of parents
    function evolve(parents, maxParents, maxIter, biasTop) {
        maxIter = maxIter || 100;
        maxParents = maxParents || 10;
        biasTop = biasTop || 1;

        var i,
            index,
            parent,
            child;

        for (i = 0; i < maxIter; i += 1) {
            index = Math.floor(Math.random() * (parents.length + biasTop)) % parents.length; // TODO: more heavily weighted sort
            parent = parents[index];
            child = mutate(parent);
            parents.push(child);

            // Re-sort and cull parents every 10 iterations
            if (i % 10 === 9) {
                // Sort parents array by descending sort
                parents.sort(parentSort);

                // Cull parents list
                while (parents.length > maxParents) {
                    parentSort.pop();
                }
            }
        }

        // Return the best timetable
        return parents[0];
    }

    // This function creates a set of random starting parents
    // Inherited variables: list
    function abiogenesis(numParents) {
        var parents = [],
            parent,
            i,
            j;

        for (i = 0; i < numParents; i += 1) {
            // Initialise new, blank parent
            parent = { classes: [], timetable: null, score: null };

            // Initialise this parents classes to be in a random order within their streams
            // NB: streams stay in the same order
            for (j = 0; j < list.length; j += 1) {
                parent.classes.push(shuffleArray(list[j]));
            }

            // Find first valid timetable and score it
            parent.timetable = dfs(parent.classes);
            parent.score = evaluateTimetable(parent.timetable, parent.classes);

            // Check for no possible timetables
            if (parent.timetable === null) { console.error('No timetables could be generated!'); return null; }

            parents.push(parent);
        }

        return parents.sort(parentSort);
    }

    var parents = abiogenesis(5),
        best = evolve(parents);

    return best.timetable;
}
