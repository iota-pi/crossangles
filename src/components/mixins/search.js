/* search.js
 *
 * Defines search algorithm to use for finding a good timetable
 * The search is done using a simply evolutionary algorithm
 *   - Initially a set of random valid timetables are created. We call these the parents.
 *   - From here on, we choose one of the parents and change it slightly to form a child.
 *   - If this child is better than any of the N-best parents, keep it and kick a parent.
 *
 * Generation of children from parents works by slightly changing the ordering of classes
 * passed into the basic search algorithm (DFS), which might find a different solution
 *
 * Authors: David
 */

// Chooses a class which doesn't cause too many clashes
function pickClass(streams, i, timetable) {
  // If we have rolled back to this point, continue from where we were up to
  let classNo = (timetable[i] + 1) || 0
  let stream = streams[i];

  // Look for a valid class
  while (classNo < stream.length) {
    if (stream[classNo].status !== 'F' || this.$store.state.options.allowFull) {
      break;
    }

    classNo += 1;
  }

  // Check for no valid solution
  if (classNo === stream.length) {
    return null;
  }

  return classNo;
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]
  }
  return array;
}

// Perform a depth-first search to try find a valid timetable
function dfs(streams, init_timetable, init_index) {
  let i = init_index || 0
  let classNo
  let timetable = init_timetable || []

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

// Sort comparison function for sorting parent list in descending order of score
function parentSort(a, b) {
  return b.score - a.score;
}

// Create a set of random starting parents
function abiogenesis(list, numParents) {
  let parents = [],

  for (let i = 0; i < numParents; i += 1) {
    // Initialise new, blank parent
    let parent = {
      streams: [],
      timetable: null,
      score: null
    };

    // Initialise this parent's classes to be in a random order within their streams
    // NB: streams stay in the same order
    for (let j = 0; j < list.length; j += 1) {
      parent.streams.push(shuffleArray(list[j].slice()));
    }

    // Find first valid timetable and score it
    parent.timetable = dfs(parent.streams);
    parent.score = scoreTimetable(parent.timetable, parent.streams);

    // Check for no possible timetables
    if (parent.timetable === null) {
      return null;
    }

    parents.push(parent);
  }

  return parents.sort(parentSort);
}

// Mutates a parent solution to produce a child solution
function mutate(parent) {
  let child = {
    streams: [],
    timetable: null,
    score: null
  }

  for (let i = 0; i < parent.streams.length; i += 1) {
    child.streams.push(parent.streams[i].slice());
  }

  // `changes` is the number of sub-stream shuffles to perform
  let changes = 1 + Math.floor(Math.random() * 3.5);
  // `unchanged` is the number of streams at the front of the array which
  // haven't been changed
  // NB: hence, it is also the index of the first stream which gets shuffled
  let unchanged = parent.streams.length

  // Shuffle some streams
  for (let i = 0; i < changes; i += 1) {
    let j = Math.floor(Math.random() * child.streams.length);
    unchanged = Math.min(unchanged, j);
    shuffleArray(child.streams[j]);
  }

  child.timetable = dfs(child.streams, parent.timetable.slice(), unchanged);
  if (child.timetable === null) {
    return child;
  }

  // Calculate a score for this new timetable
  child.score = scoreTimetable(child.timetable, child.streams);

  return child;
}

// Evolves given list of parents
function evolve(parents, maxParents, maxIter, biasTop) {
  if (parents === null) {
    return null;
  }
  if (maxIter === 0) {
    return parents[0];
  }

  maxIter = maxIter || 5000; // recommended default: 5000
  maxParents = maxParents || 40;
  biasTop = biasTop || 5;

  const startTime = (new Date()).getTime(),
  const maxRunTime = 500; // maximum time to run search in ms

  for (let i = 1; i <= maxIter; i += 1) {
    let index = Math.floor(Math.random() * (parents.length + biasTop)) % parents.length;
    let parent = parents[index];
    let child = mutate(parent);

    // If we couldn't generate a child timetable for some reason, move on to the next one
    if (child.timetable === null) {
      continue;
    }

    // Add to parents array
    parents.push(child);

    // Re-sort and cull parents every 10th iteration
    if (i % 10 === 0) {
      // Sort parents array by descending sort
      parents.sort(parentSort);

      // Cull parents list by removing worst-scoring timetables
      while (parents.length > maxParents) {
        parents.pop();
      }

      // End iterations if function has run for too long
      if ((new Date()).getTime() - startTime > maxRunTime) {
        console.warn('search(): max execution time reached after ' + i + ' iterations');
        break;
      }
    }
  }

  // Return the best timetable
  parents.sort(parentSort);
  //console.log('Found timetable with score', parents[0].score, 'in', (new Date()).getTime() - time, 'ms');
  return parents[0];
}

/* search()
 * Main timetable search function
 */
function search(list, searchMax, allowFull) {
  if (list.length === 0) {
    return [];
  }
  allowFull = allowFull || this.$store.state.options.allowFull;

  let initial = (searchMax > 0) ? 50 : 1,
  let parents = abiogenesis(list, initial),
  let best = evolve(parents, undefined, searchMax);

  return best;
}
export default search;
