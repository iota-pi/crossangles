/* search.js
 *
 * Defines search algorithm to use for finding best timetable as well as evaluation function for timetables
 *
 * Authors: David
 */

/*globals console, scoreTimetable */

function search(list, maxClash, searchMax) {
    'use strict';
    if (maxClash === undefined) { maxClash = 0; }
    if (list.length === 0) { return []; }

    // Checks whether two given time strings clash with each other
    function classClash(a, b) {
        // If days are different, then there is clearly no clash
        if (a[0] !== b[0]) { return false; }

        // If a clash is permitted for either course, there is no clash to worry about
        if (a[3] || b[3]) { return false; }

        // The overlap between two intervals will be the difference (if positive) between the smallest upper-bound and the largest lower-bound
        return Math.max(0, Math.min(a[2], b[2]) - Math.max(a[1], b[1]));
    }

    // Checks whether two given time strings clash with each other
    // Inherited variables: maxClash
    function countClashes(streams, timetable, newTime) {
        var i, j, k, stream, times, count = 0;
        for (i = 0; i < newTime.length; i += 1) {
            for (j = 0; j < timetable.length; j += 1) {
                stream = streams[j][timetable[j]];
                times = stream.time;
                for (k = 0; k < times.length; k += 1) {
                    count += classClash(newTime[i], times[k]);
                }
            }
        }

        return count;
    }

    // Chooses a class which doesn't cause too many clashes
    // Inherited variables: maxClash
    function pickClass(streams, i, timetable) {
        var classNo = (timetable[i] + 1) || 0,        // If we have rolled back to this point, continue from where we were up to
            stream = streams[i];

        // Keep looking for a class while there is a clash
        while (classNo < stream.length && countClashes(streams, timetable, stream[classNo].time) > maxClash) {
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
            classNo,
            timetable = init_timetable || [];

        // If we started with init_index and init_timetable, clear all timetable elements after init_index
        if (init_index !== undefined) {
            while (timetable.length > init_index) {
                timetable.pop();
            }
        }

        while (i < streams.length) {
            // Pick first class for this steam that doesn't have a clash
            classNo = pickClass(streams, i, timetable);

            // Roll back if all streams in stream cause a clash
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

    // Randomly shuffle array element order (in place!) (using Durstenfeld shuffle algorithm)
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

    // Sort comparison function for sorting parent list in descending order of score
    function parentSort(a, b) {
        return b.score - a.score;
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
            parent = { streams: [], timetable: null, score: null };

            // Initialise this parents streams to be in a random order within their streams
            // NB: streams stay in the same order
            for (j = 0; j < list.length; j += 1) {
                parent.streams.push(shuffleArray(list[j].slice()));
            }

            // Find first valid timetable and score it
            parent.timetable = dfs(parent.streams);
            parent.score = scoreTimetable(parent.timetable, parent.streams);

            // Check for no possible timetables
            if (parent.timetable === null) { return null; }

            parents.push(parent);
        }

        return parents.sort(parentSort);
    }

    // Mutates a parent solution to produce a child solution
    function mutate(parent) {
        var child = { streams: [], timetable: null, score: null },
            i,
            j;
        for (i = 0; i < parent.streams.length; i += 1) {
            child.streams.push(parent.streams[i].slice());
        }

        while (child.timetable === null) {
            j = Math.floor(Math.random() * child.streams.length);
            shuffleArray(child.streams[j]);
            child.timetable = dfs(child.streams, parent.timetable.slice(), j);
        }

        // Calculate a score for this new timetable
        child.score = scoreTimetable(child.timetable, child.streams);

        return child;
    }

    // Evolves given list of parents
    function evolve(parents, maxParents, maxIter, biasTop) {
        if (parents === null) { return null; }
        if (maxIter === 0) { return parents[0]; }

        maxIter = maxIter || 5000;
        maxParents = maxParents || 20;
        biasTop = biasTop || 5;

        var i,
            index,
            parent,
            child,
            time = (new Date()).getTime(),
            maxRunTime = 500;       // maximum time to run search in ms

        for (i = 0; i < maxIter; i += 1) {
            index = Math.floor(Math.random() * (parents.length + biasTop)) % parents.length; // TODO: more heavily weighted bias? (probably not necessary...)
            parent = parents[index];
            child = mutate(parent);
            parents.push(child);

            // Re-sort and cull parents every 10th iteration
            if (i % 10 === 9) {
                // Sort parents array by descending sort
                parents.sort(parentSort);

                // Cull parents list by removing worst-scoring timetables
                while (parents.length > maxParents) {
                    parents.pop();
                }

                // End iterations if function has run for too long
                if ((new Date()).getTime() - time > maxRunTime) {
                    console.warn('search(): max execution time reached after ' + i + ' iterations');
                    break;
                }
            }
        }

        // Return the best timetable
        parents.sort(parentSort);
        return parents[0];
    }

    var initial = (searchMax > 0) ? 50 : 1,
        parents = abiogenesis(initial),
        best = evolve(parents, undefined, searchMax);

    if (best === null) { return null; }

    // Return actual stream elements rather than only indexes
    return best.timetable.map(function (x, i) { return best.streams[i][x]; });
}