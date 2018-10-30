/* search.js
 *
 * Defines search algorithm to use for finding a good timetable
 * The search is done using a simply evolutionary algorithm
 *   - Initially a set of random valid timetables are created. We call these the parents.
 *   - From here on, we choose one of the parents and change it slightly to form a child.
 *   - If this child is better than a parents, keep it and kick the worst parent.
 *
 * Generation of children from parents works by slightly changing the ordering of classes
 * passed into the basic search algorithm (DFS), which might find a different solution
 *
 * Authors: David
 */

import { scoreTimetable } from './score'

// Chooses a class which isn't full
function pickClass (components, i, timetable, allowFull) {
  // If we have rolled back to this point, continue from where we were up to
  let streamNo = (timetable[i] + 1) || 0
  let component = components[i]

  // Look for a valid class
  while (streamNo < component.length) {
    if (component[streamNo].status === 1 || allowFull) {
      break
    }

    streamNo += 1
  }

  // Check for no valid solution
  if (streamNo === component.length) {
    return null
  }

  return streamNo
}

function shuffleArray (array) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    let j = Math.floor(Math.random() * (i + 1))
    let temp = array[j]
    array[j] = array[i]
    array[i] = temp
  }
  return array
}

// Perform a depth-first search to try find a valid timetable
function dfs (components, allowFull, initTimetable, initIndex) {
  let timetable = initTimetable || []
  let i = initIndex || 0

  // If we started with init_index and init_timetable, clear all timetable elements after init_index
  if (initIndex !== undefined) {
    while (timetable.length > initIndex) {
      timetable.pop()
    }
  }

  let streamNo
  while (i < components.length) {
    // Pick the next *valid* stream for this component
    // NB: valid stream = not full OR we are allow to choose full classes
    streamNo = pickClass(components, i, timetable, allowFull)

    // Roll back if all streams for this component cause a clash
    if (streamNo === null) {
      // Remove this item from timetable (if it has already been set)
      if (i < timetable.length) {
        timetable.pop()
      }

      // Step back to previous component
      i -= 1

      // Check if we've rolled all the way back past the start
      // (i.e. impossible to generate valid timetable)
      if (i < 0) {
        return null
      }
    } else {
      // Record chosen stream for this component in the timetable
      timetable[i] = streamNo

      // Move on to next component
      i += 1
    }
  }

  // At this point, valid timetable has successfully been found
  return timetable
}

// Sort comparison function for sorting parent list in descending order of score
function parentSort (a, b) {
  return b.score - a.score
}

// Create a set of random starting parents
function abiogenesis (components, numParents, pastTimetable, allowFull) {
  let parents = []

  for (let i = 0; i < numParents; i += 1) {
    // Initialise new, blank parent
    let parent = {
      components: [],
      timetable: null,
      score: null
    }

    // Initialise this parent's streams to a random order within each component
    // NB: components order remains consistent
    for (let j = 0; j < components.length; j++) {
      parent.components.push(shuffleArray(components[j].streams.slice()))
    }

    // Find first valid timetable and score it
    parent.timetable = dfs(parent.components, allowFull)
    parent.score = scoreTimetable(parent.timetable, pastTimetable, parent.components)

    // Check for no possible timetables
    if (parent.timetable === null) {
      return null
    }

    parents.push(parent)
  }

  return parents.sort(parentSort)
}

// Mutates a parent solution to produce a child solution
function mutate (parent, pastTimetable, allowFull) {
  let child = {
    components: [],
    timetable: null,
    score: null
  }

  let components = parent.components
  for (let i = 0; i < components.length; i++) {
    child.components.push(components[i].slice())
  }

  // `changes` is the number of shuffles to perform
  let changes = 1 + Math.floor(Math.random() * 3.5)
  // `unchanged` is the number of components at the front of the array which
  // haven't been changed
  // NB: hence, it is also the index of the first component which gets shuffled
  let unchanged = parent.components.length

  // Shuffle stream orders for some components
  for (let i = 0; i < changes; i += 1) {
    let j = Math.floor(Math.random() * child.components.length)
    unchanged = Math.min(unchanged, j)
    shuffleArray(child.components[j])
  }

  child.timetable = dfs(child.components, allowFull, parent.timetable.slice(), unchanged)
  if (child.timetable === null) {
    return child
  }

  // Calculate a score for this new timetable
  child.score = scoreTimetable(child.timetable, pastTimetable, child.components)

  return child
}

// Evolves given list of parents
function evolve (parents, maxParents, maxIter, biasTop, pastTimetable, allowFull) {
  if (parents === null) {
    return null
  }
  if (maxIter === 0) {
    return parents[0]
  }

  maxIter = maxIter || 5000 // recommended default: 5000
  maxParents = maxParents || 40
  biasTop = biasTop || 5

  const startTime = (new Date()).getTime()
  const maxRunTime = 1000 // maximum time to run search in ms

  for (let i = 1; i <= maxIter; i += 1) {
    let index = Math.floor(Math.random() * (parents.length + biasTop)) % parents.length
    let parent = parents[index]
    let child = mutate(parent, pastTimetable, allowFull)

    // If we couldn't generate a child timetable for some reason, move on to the next one
    if (child.timetable === null) {
      continue
    }

    // Add to parents array
    parents.push(child)

    // Re-sort and cull parents every 10th iteration
    if (i % 10 === 0) {
      // Sort parents array by descending sort
      parents.sort(parentSort)

      // Cull parents list by removing worst-scoring timetables
      while (parents.length > maxParents) {
        parents.pop()
      }

      // End iterations if function has run for too long
      if ((new Date()).getTime() - startTime > maxRunTime) {
        console.warn('search(): max execution time reached after ' + i + ' iterations')
        break
      }
    }
  }

  // Return the best timetable
  parents.sort(parentSort)
  // console.log('Found timetable with score', parents[0].score, 'in', (new Date()).getTime() - startTime, 'ms')
  return parents[0]
}

/*
 * Mixin for main timetable search function: `search()`
 */
export default {
  methods: {
    search (components, searchMax, pastTimetable) {
      if (components.length === 0) {
        return { timetable: [] }
      }

      const allowFull = this.$store.state.options.allowFull
      const numParents = 50
      let parents = abiogenesis(components, numParents, pastTimetable, allowFull)
      if (parents === null) {
        // No possible timetables
        return null
      }

      // Evolve from initial solutions to find the best timetable
      let best = evolve(parents, undefined, searchMax, undefined, pastTimetable, allowFull)

      // Convert the timetable indexes to the actual stream objects
      best.raw = best.timetable
      best.timetable = best.timetable.map((x, i) => best.components[i][x])

      return best
    }
  }
}
