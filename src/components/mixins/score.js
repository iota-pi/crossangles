/* evaluate.js
 * Defines evaluation functions for scoring timetable
 *
 * Authors: David
 */

function timetableToArray (timetableData, streams) {
  let timetable = [ [], [], [], [], [] ]
  let clashAllowances = [ [], [], [], [], [] ]
  const dayOfWeek = ['M', 'T', 'W', 'H', 'F']

  // Convert to timetable array
  for (let stream of timetableData) {
    for (let session of stream.timetable) {
      let time = session.time
      let day = dayOfWeek.indexOf(time.day)
      for (let hour = time.start; hour < time.end; hour += 0.5) {
        // Initialise to blank array if required
        if (timetable[day][hour * 2] === undefined) {
          timetable[day][hour * 2] = []
          clashAllowances[day][hour * 2] = []
        }

        // Add this course to the list of courses in this half-hour slot
        timetable[day][hour * 2].push(stream)
        clashAllowances[day][hour * 2].push(time.canClash)
      }
    }
  }

  return [timetable, clashAllowances]
}

function scoreFreeDays (timetable) {
  const freeDayScores = [140, 100, 130, 110, 150]
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
  const clashScore = -200
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
        score += clashScore * Math.max(count - 1, 0)
      }
    }
  }

  return score
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

  for (let stream of timetableData) {
    for (let session of stream.timetable) {
      score += scoreClassTime(session.time.start, session.time.end)
    }
  }

  return score
}

function scoreProximity (timetable, timetableData) {
  // This function gives bonus points for CBS events being near other events/classes
  // NB: since CBS events are 2 half-hours long they will each automatically be
  // given (adjacentScore * 2) points from this function
  // i.e: the first half hour will score the second as adjacent, and vice versa

  const adjacentScore = 25
  let score = 0

  for (let i = 0; i < timetable.length; i += 1) {
    for (let j = 0; j < timetable[i].length; j += 1) {
      if (timetable[i][j] !== undefined) {
        for (let k = 0; k < timetable[i][j].length; k += 1) {
          if (timetable[i][j][k].course.code === 'CBS') {
            // Check previous half hour
            if (timetable[i][j - 1] !== undefined) {
              score += adjacentScore
            }
            // Check next half hour
            if (timetable[i][j + 1] !== undefined) {
              score += adjacentScore
            }
          }
        }
      }
    }
  }

  return score
}

function scoreDayLength (timetable) {
  const perHalfHour = -5
  let score = 0

  for (let i = 0; i < timetable.length; i += 1) {
    // No need to score empty days
    if (timetable[i].length > 0) {
      // Get index of first defined element in this array
      let j
      for (j = 0; j < timetable[i].length; j += 1) {
        if (timetable[i][j] !== undefined) {
          break
        }
      }

      score += perHalfHour * (timetable[i].length - j)
    }
  }

  return score
}

function scoreArvoTeaGap (timetable, timetableData) {
  // NB: 5 points more than adjacency bonus for having class afterwards
  const arvoTeaScore = 30

  for (let i = 0; i < timetable.length; i += 1) {
    for (let j = 0; j < timetable[i].length; j += 1) {
      if (timetable[i][j] !== undefined) {
        for (let k = 0; k < timetable[i][j].length; k += 1) {
          let code = timetable[i][j][k].course.code
          let component = timetable[i][j][k].component
          if (code === 'CBS' && component === 'The Bible Talks') {
            // Check start of next hour
            if (timetable[i][j + 2] === undefined) {
              return arvoTeaScore
            }
          }
        }
      }
    }
  }

  return 0
}

function scoreTimetable (indexTimetable, streams) {
  if (indexTimetable === null) {
    return null
  }

  let timetableData = indexTimetable.map((x, i) => streams[i][x])
  let [ timetable, clashAllowances ] = timetableToArray(timetableData, streams)
  let score = 0

  score += scoreFreeDays(timetable)
  score += scoreClashes(timetable, clashAllowances)
  score += scoreTimes(timetableData)
  score += scoreProximity(timetable, timetableData)
  score += scoreDayLength(timetable)
  score += scoreArvoTeaGap(timetable, timetableData)

  return score
}

export {
  scoreTimetable
}
