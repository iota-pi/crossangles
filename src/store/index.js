import axios from 'axios'
import parseCourses from './parseJSON'
import _colors from '../components/mixins/colors'
let colors = _colors.data()

const dataURL = '/static/tt.json'
const storage = window.localStorage

function processData (context, data) {
  let chosen = storage.getItem('chosen')
  let events = storage.getItem('events')
  let options = storage.getItem('options')
  let timetable = storage.getItem('timetable')
  let webStreams = storage.getItem('webStreams')
  let custom = storage.getItem('custom')

  context.commit('courses', data.courses)
  context.commit('meta', data.meta)

  if (chosen) {
    // Restore previously chosen courses
    chosen = JSON.parse(chosen)
    let restored = []
    for (let course of chosen) {
      if (!course.custom) {
        context.state.courses[course.code].color = course.color
        restored.push(context.state.courses[course.code])
      }
    }

    context.commit('chosen', restored)
  } else {
    // Default to just CBS chosen
    context.commit('chosen', [context.state.courses.CBS])
  }

  if (events) {
    // Restore previously selected events
    events = JSON.parse(events)
    context.commit('events', events)
  } else {
    // Default to all CBS events
    let components = context.state.courses.CBS.streams.map(s => s.component)
    let events = components.filter((c, i) => components.indexOf(c) === i)
    context.commit('events', events)
  }

  if (options) {
    // Restore previously selected options
    options = JSON.parse(options)
    context.commit('options', options)
  } else {
    // Default to none selected
    context.commit('options', {})
  }

  if (webStreams) {
    // Restore previously selected options
    webStreams = JSON.parse(webStreams)
    context.commit('webStreams', webStreams)
  } else {
    // Default to none selected
    context.commit('webStreams', [])
  }

  if (custom) {
    // Restore previously selected options
    custom = JSON.parse(custom)
    context.commit('custom', custom)
    for (let c of custom) {
      context.dispatch('addCustom', c)
    }
  } else {
    // Default to none selected
    context.commit('custom', [])
  }

  if (timetable) {
    timetable = JSON.parse(timetable)

    let restored = []
    for (let item of timetable) {
      let course = context.state.courses[item.code]
      if (course === undefined) {
        course = context.state.chosen.filter(c => c.code === item.code)[0]
      }

      let stream = course.streams.filter(s => {
        // Check that this stream is for the right component
        if (s.component !== item.component) {
          return false
        }

        // Check that this is not a WEB stream
        if (s.web) {
          return false
        }

        // Check for correct day/time
        if (s.sessions[item.index].time.day !== item.time.day) {
          return false
        }
        if (s.sessions[item.index].time.start !== item.time.start) {
          return false
        }
        if (s.sessions[item.index].time.end !== item.time.end) {
          return false
        }

        return true
      })[0]
      restored.push(stream.sessions[item.index])
    }

    context.commit('timetable', restored)
  } else {
    // Default to empty timetable
    context.commit('timetable', [])
  }
}

function choice (array) {
  return array[Math.floor(Math.random() * array.length)]
}

export default {
  state: {
    courses: {},
    meta: {},
    chosen: [],
    events: [],
    options: {},
    timetable: [],
    webStreams: [],
    custom: [],
    alert: null,
    loading: true
  },
  mutations: {
    courses (state, data) {
      state.courses = parseCourses(data)
    },
    meta (state, data) {
      state.meta = data
    },
    chosen (state, data) {
      state.chosen = data

      storage.setItem('chosen', JSON.stringify(data.map(c => {
        return {
          code: c.code,
          color: c.color,
          custom: c.custom
        }
      })))
    },
    custom (state, data) {
      state.custom = data

      storage.setItem('custom', JSON.stringify(data))
    },
    events (state, data) {
      state.events = data

      storage.setItem('events', JSON.stringify(data))
    },
    options (state, data) {
      state.options = data

      storage.setItem('options', JSON.stringify(data))
    },
    timetable (state, data) {
      state.timetable = data

      storage.setItem('timetable', JSON.stringify(data.map(session => {
        return {
          code: session.course.code,
          component: session.stream.component,
          time: session.time,
          index: session.index
        }
      })))
    },
    alert (state, data) {
      state.alert = data
    },
    loading (state, data) {
      state.loading = data
    },
    webStreams (state, data) {
      state.webStreams = data
      storage.setItem('webStreams', JSON.stringify(data))
    }
  },
  actions: {
    loadData (context) {
      let pastData = storage.getItem('courseData')
      if (pastData) {
        processData(context, JSON.parse(pastData))
      }

      axios.get(dataURL).then((r) => {
        storage.setItem('courseData', JSON.stringify(r.data))
        processData(context, r.data)

        // Disable the loading block on auto timetable updating
        // NB: this block exists to prevent restored timetable being overwritten
        window.setTimeout(() => context.commit('loading', false), 100)
      })
    },
    reset (context) {
      const CBS = context.state.courses.CBS
      let components = CBS.streams.map(s => s.component)
      let events = components.filter((c, i) => components.indexOf(c) === i)
      context.commit('chosen', [CBS])
      context.commit('events', events)
      context.commit('options', {})
      context.commit('timetable', [])
      context.commit('webStreams', [])
    },
    addCourse (context, course) {
      // Assign this course an unused color
      if (!course.color) {
        let used = context.state.chosen.map(course => course.color)
        course.color = choice(colors.colors.filter(c => !used.includes(c)))
      }

      // Add this course and then sort the list of chosen courses
      const chosen = context.state.chosen
      let courses = chosen.slice(0, -1)
      courses.push(course)
      courses.sort((a, b) => (a.code > b.code) - (a.code < b.code))
      courses.push(chosen[chosen.length - 1])

      context.commit('chosen', courses)
    },
    addCustom (context, custom) {
      let customCourse = {
        code: 'custom_' + custom.id,
        title: custom.name,
        custom: true,
        color: null,
        streams: null
      }
      customCourse.streams = custom.options.map(o => {
        let stream = {
          course: customCourse,
          component: custom.name,
          web: false,
          status: 1,
          enrols: null,
          sessions: null
        }
        stream.sessions = [
          {
            course: customCourse,
            stream: stream,
            location: null,
            time: {
              day: o.day,
              start: o.time,
              end: o.time + custom.duration,
              canClash: false
            },
            weeks: null,
            index: 0,
            snapToggle: false
          }
        ]
        return stream
      })

      context.dispatch('addCourse', customCourse)
      custom.color = customCourse.color
    }
  }
}
