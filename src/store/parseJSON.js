import _colors from '../components/mixins/colors'
let colors = _colors.data()

function parseCourses (data) {
  let courses = {}

  for (let course of data) {
    let code = course.code
    courses[code] = {
      code: code,
      title: course.name,
      custom: false,
      color: code !== 'CBS' ? null : colors.CBScolor,
      streams: null
    }
    courses[code].streams = parseStreams(course.streams, courses[code])
  }

  return courses
}

function parseStreams (streams, course) {
  let result = []

  for (let stream of streams) {
    let newStream = {
      course: course,
      component: stream.component,
      web: !!stream.web,
      status: stream.status,
      enrols: stream.enrols,
      sessions: null
    }

    // Process sessions (excluding WEB streams, which have none)
    if (stream.web !== 1) {
      newStream.sessions = parseSessions(stream.times, course, newStream)
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
      weeks: time[2],
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
