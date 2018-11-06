import axios from 'axios'
import parseCourses from './parseJSON'
import processData from './processData'
import _colors from '../components/mixins/colors'
let colors = _colors.data()

const dataURL = '/static/tt.json'
const storage = window.localStorage

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
