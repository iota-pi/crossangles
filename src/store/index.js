import axios from 'axios'
import _colors from '../components/mixins/colors'
let colors = _colors.data()

const dataURL = '/static/tt.json'

function parseStreams (streams, course) {
  let result = []

  for (let stream of streams) {
    let nextStream = {
      course: course,
      component: stream.component,
      status: stream.status,
      enrols: stream.enrols,
      sessions: null
    }
    nextStream.sessions = parseSessions(stream.times, course, nextStream)
    result.push(nextStream)
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
  // strict: process.env.NODE_ENV !== 'production',
  state: {
    courses: {},
    chosen: [],
    events: [],
    options: {}
  },
  mutations: {
    courses (state, data) {
      let courses = Object.assign({}, state.courses)

      for (let course of data) {
        let code = course.code
        courses[code] = {
          code: code,
          title: course.name,
          color: code !== 'CBS' ? null : colors.CBScolor,
          streams: null
        }
        courses[code].streams = parseStreams(course.streams, courses[code])
      }

      state.courses = courses
    },
    chosen (state, data) {
      state.chosen = data
    },
    events (state, data) {
      state.events = data
    },
    options (state, data) {
      state.options = data
    }
  },
  actions: {
    loadData (context) {
      axios.get(dataURL).then((r) => {
        context.commit('courses', r.data.courses)
      })
      axios.get('/static/cbs.json').then((r) => {
        context.commit('courses', r.data)
        if (context.state.chosen.length === 0) {
          context.commit('chosen', [context.state.courses.CBS])
        }
        if (context.state.events.length === 0) {
          let components = context.state.courses.CBS.streams.map(s => s.component)
          let events = components.filter((c, i) => components.indexOf(c) === i)
          context.commit('events', events)
        }
      })
    }
  }
}
