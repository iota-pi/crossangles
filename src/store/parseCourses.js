import { CBScolor } from './colors'

function parseCourses (data) {
  let courses = {}

  for (let i = 0; i < data.length; i++) {
    let course = data[i]
    let code = course.c
    courses[code] = {
      code: code,
      title: course.n,
      custom: false,
      color: code !== 'CBS' ? null : CBScolor,
      streams: null
    }
    courses[code].streams = parseStreams(course.s, courses[code])
  }

  return courses
}

function parseStreams (streams, course) {
  let result = []

  for (let i = 0; i < streams.length; i++) {
    let stream = streams[i]
    let newStream = {
      course: course,
      component: stream.c,
      web: !!stream.w,
      status: stream.s,
      enrols: stream.e,
      sessions: null
    }

    // Process sessions (excluding WEB streams, which have none)
    if (stream.w !== 1) {
      newStream.sessions = parseSessions(stream.t, course, newStream)
    }
    result.push(newStream)
  }

  return result
}

function parseSessions (times, course, stream) {
  let timetable = []

  for (let i = 0; i < times.length; i++) {
    let time = times[i]
    timetable.push({
      course: course,
      stream: stream,
      location: time[1],
      time: parseTimeString(time[0]),
      index: i,
      snapToggle: false
    })
  }

  return timetable
}

function parseTimeString (time) {
  let day = time.charAt(0)
  let canClash = /#$/.test(time)
  let hours = time.substr(1).replace('#', '').split('-').map(x => parseFloat(x))
  if (hours.length === 1) {
    hours.push(hours[0] + 1)
  }
  let [ start, end ] = hours

  return {
    day,
    start,
    end,
    canClash
  }
}

export default parseCourses
