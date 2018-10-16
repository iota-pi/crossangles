import axios from 'axios'

const dataURL = '/static/tt.json'

function parseStreams (streams, course) {
  let result = []

  for (let stream of streams) {
    let nextStream = {
      course: course,
      component: stream.component,
      status: stream.status,
      enrols: stream.enrols.split('/'),
      times: null
    }
    nextStream.times = parseTimetable(stream.times, course, nextStream)
    result.push(nextStream)
  }

  return result
}

function parseTimetable (times, course, stream) {
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
      snap: false
    })
  }

  return timetable
}

function parseTimeString (time) {
  let day = time.substr(0, 1)
  let canClash = /#$/.test(time)
  let hours = time.substr(1).replace('#', '').split('-').map(x => parseInt(x))
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

export default {
  state: {
    courseData: {},
    courses: [],
    events: [],
    options: {},
    timetable: []
  },
  mutations: {
    courseData (state, data) {
      let courses = {}

      for (let course of data.courses) {
        let code = course.code
        courses[code] = {
          code: code,
          title: course.name,
          streams: null
        }
        courses[code].streams = parseStreams(course.streams, courses[code])
      }

      state.courseData = courses
    },
    courses (state, data) {
      state.courses = data
    },
    events (state, data) {
      state.events = data
    },
    options (state, data) {
      state.options = data
    },
    timetable (state, data) {
      state.timetable = data
    }
  },
  actions: {
    loadData (context) {
      axios.get(dataURL).then((r) => {
        context.commit('courseData', r.data)
      })
    }
  }
}
