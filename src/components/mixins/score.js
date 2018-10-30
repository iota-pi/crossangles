/* evaluate.js
 * Defines evaluation functions for scoring timetable
 *
 * Authors: David
 */

const earliestStart = 8

function timetableToArray (timetableData) {
  let timetable = [ [], [], [], [], [] ]
  let clashAllowances = [ [], [], [], [], [] ]
  const dayOfWeek = ['M', 'T', 'W', 'H', 'F']

  // Convert to timetable array
  for (let i = 0; i < timetableData.length; i++) {
    let sessions = timetableData[i].sessions
    for (let j = 0; j < sessions.length; j++) {
      let session = sessions[j]
      let time = session.time
      let canClash = time.canClash
      let day = dayOfWeek.indexOf(time.day)
      let start = (time.start - earliestStart) * 2
      let end = start + (time.end - time.start) * 2
      for (let h = start; h < end; h++) {
        // Initialise to blank array if required
        if (timetable[day][h] === undefined) {
          timetable[day][h] = [ session ]
          clashAllowances[day][h] = [ canClash ]
        } else {
          // Add this course to the list of courses in this half-hour slot
          timetable[day][h].push(session)
          clashAllowances[day][h].push(canClash)
        }
      }
    }
  }

  return [timetable, clashAllowances]
}

function scoreFreeDays (timetable) {
  const freeDayScores = [190, 150, 180, 160, 200]
  let score = 0

  for (let i = 0; i < timetable.length; i += 1) {
    // This day is free (no classes) if the length of the array is 0
    if (timetable[i].length === 0) {
      score += freeDayScores[i]
    }
  }

  return score
}

function scoreClashes (timetable, clashAllowances) {
  // NB: clash scoring is per half-hour
  const clashScore = -300
  let score = 0

  for (let i = 0; i < timetable.length; i += 1) {
    for (let j = 0; j < timetable[i].length; j += 1) {
      if (timetable[i][j] !== undefined) {
        // There is a clash whenever there is more than one element in each half-hour slot
        let count = 0
        for (let k = 0; k < timetable[i][j].length; k += 1) {
          if (!clashAllowances[i][j][k]) {
            count += 1
          } else {
            count += 0.5
          }
        }
        score += Math.max(count - 1, 0)
      }
    }
  }

  return clashScore * score
}

function scoreClassTime (start, end) {
  // Scoring function is: -(t-14)^2 + 9
  // All positive scores are ignored, hence from 11am-5pm, there is no differentiation
  let scoreStart = -((start - 14) * (start - 14)) + 9
  let scoreEnd = -((end - 14) * (end - 14)) + 9

  // Return the worst of the start and end time score, capped at 0
  // i.e. can't gain score for class times
  return Math.min(scoreStart, scoreEnd, 0)
}

function scoreTimes (timetableData) {
  let score = 0

  for (let i = 0; i < timetableData.length; i++) {
    for (let j = 0; j < timetableData[i].length; j++) {
      let time = timetableData[i][j].time
      score += scoreClassTime(time.start, time.end)
    }
  }

  return score
}

// Give bonus points for CBS events being directly adjacent to other sessions
function scoreProximity (timetable, timetableData) {
  const adjacentScore = 25
  const days = ['M', 'T', 'W', 'H', 'F']
  let score = 0

  for (let i = 0; i < timetableData.length; i++) {
    if (timetableData[i].course.code === 'CBS') {
      // NB: assumes CBS events don't have multiple sessions per stream
      let time = timetableData[i].sessions[0].time
      let day = days.indexOf(time.day)
      let before = (time.start - earliestStart) * 2 - 1
      if (timetable[day][before] !== undefined) {
        score++
      }

      let after = (time.end - earliestStart) * 2
      if (timetable[day][after] !== undefined) {
        score++
      }
    }
  }

  return adjacentScore * score
}

function scoreDayLength (timetable) {
  const perHalfHour = -5
  let score = 0

  for (let i = 0; i < timetable.length; i += 1) {
    // No need to score empty days
    if (timetable[i].length > 0) {
      // Get index of first defined element in this array
      let j = 0
      for (; j < timetable[i].length; j += 1) {
        if (timetable[i][j] !== undefined) {
          break
        }
      }

      score += timetable[i].length - j
    }
  }

  return perHalfHour * score
}

function scoreUnchanged (timetableData, past) {
  const perSession = 30
  let score = 0

  for (let i = 0; i < timetableData.length; i++) {
    let sessions = timetableData[i].sessions
    for (let j = 0; j < sessions.length; j++) {
      for (let k = 0; k < past.length; k++) {
        if (sessions[j] === past[k]) {
          score += perSession
          break
        }
      }
    }
  }

  return score
}

function scoreTimetable (indexTimetable, pastTimetable, streams) {
  if (indexTimetable === null) {
    return null
  }

  let timetableData = indexTimetable.map((x, i) => streams[i][x])
  let [ timetable, clashAllowances ] = timetableToArray(timetableData)
  let score = 0

  score += scoreFreeDays(timetable)
  score += scoreClashes(timetable, clashAllowances)
  score += scoreTimes(timetableData)
  score += scoreProximity(timetable, timetableData)
  score += scoreDayLength(timetable)
  score += scoreUnchanged(timetableData, pastTimetable)

  return score
}

export {
  scoreTimetable
}
