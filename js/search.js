/* search.js
 *
 * Defines search algorithm to use for finding best timetable as well as evaluation function for timetables
 */

function search(list, maxClash) {
    'use strict';

    // Checks whether two given time strings clash with each other
    function classClash(a, b) {
        // If days are different, then there is clearly no clash
        if (a[0] !== b[0]) { return false; }

        // Iff the start of one is later than the end of the other, then there is no overlap
        if (a[1] >= b[2] || b[1] >= a[2]) {
            return false;
        }

        return true;
    }

    // Checks whether two given time strings clash with each other
    // Inherited variables: maxClash
    function checkClashes(streams, timetable, newTime) {
        var i, j, k, stream, times, count = 0;
        for (i = 0; i < newTime.length; i += 1) {
            for (j = 0; j < timetable.length; j += 1) {
                stream = streams[j][timetable[j]];
                times = stream[0];
                for (k = 0; k < times.length; k += 1) {
                    if (classClash(newTime[i], times[k])) {
                        count += 1;
                        if (count > maxClash) {
                            return true;
                        }
                    }
                }
            }
        }

        return false;
    }

    // Chooses a class which doesn't cause too many clashes
    function pickClass(streams, i, timetable) {
        var classNo = timetable[i] || 0,        // If we have rolled back to this point, continue from where we were up to
            stream = streams[i];

        // Keep looking for a class while there is a clash
        while (classNo < stream.length && checkClashes(streams, timetable, stream[classNo])) {
            classNo += 1;
        }

        // Check for no valid solution
        if (classNo === stream.length) {
            return null;
        }

        return classNo;
    }

    // Perform a depth-first search to try find a valid timetable
    function dfs(streams) {
        var i = 0,
            stream,
            classNo,
            timetable;

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
}
