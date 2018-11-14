import { CBScolor } from './colors'

function parseCourses (data) {
  let courses = {}

  for (let i = 0, l = data.length; i < l; i++) {
    let _course = data[i]
    let code = _course.c
    let course = {
      code: code,
      title: _course.n,
      custom: false,
      color: code !== 'CBS' ? null : CBScolor,
      streams: null
    }
    course.streams = parseStreams(_course.s, course)
    courses[code] = course
  }

  return courses
}

function parseStreams (streams, course) {
  let result = []

  for (let i = 0, l = streams.length; i < l; i++) {
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
    result[i] = newStream
  }

  return result
}

function parseSessions (times, course, stream) {
  let timetable = []

  for (let i = 0, l = times.length; i < l; i++) {
    let time = times[i][0]
    let day = time.charAt(0)
    let canClash = time.charAt(time.length - 1) === '#'
    let hours = time.substr(1, time.length - 1 - canClash).split('-')
    hours = hours.map(x => parseFloat(x))

    timetable[i] = {
      course: course,
      stream: stream,
      location: times[i][1],
      time: {
        day: day,
        start: hours[0],
        end: hours[1] || (hours[0] + 1),
        canClash: canClash
      },
      index: i,
      snapToggle: false
    }
  }

  return timetable
}

export default parseCourses
