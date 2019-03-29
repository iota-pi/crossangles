import Vue from 'vue'
import Vuex from 'vuex'

import axios from 'axios'
import parseCourses from './parseCourses'
import processData from './processData'
import { colors } from './colors'

const dataURL = process.env.VUE_APP_DATAURI
const storage = window.localStorage

function choice (array) {
  return array[Math.floor(Math.random() * array.length)]
}

Vue.use(Vuex)

export default new Vuex.Store({
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
    loading: true,
    updateAvailable: false,
    serviceWorker: null
  },
  mutations: {
    courses (state, data) {
      state.courses = data
    },
    meta (state, data) {
      state.meta = data

      storage.setItem('meta', JSON.stringify(data))
    },
    chosen (state, data) {
      state.chosen = data

      if (!state.loading) {
        storage.setItem('chosen', JSON.stringify(data.map(c => {
          return {
            code: c.code,
            key: c.key,
            color: c.color,
            custom: c.custom
          }
        })))
      }
    },
    custom (state, data) {
      state.custom = data

      if (!state.loading) {
        storage.setItem('custom', JSON.stringify(data))
      }
    },
    events (state, data) {
      state.events = data

      if (!state.loading) {
        storage.setItem('events', JSON.stringify(data))
      }
    },
    options (state, data) {
      state.options = data

      if (!state.loading) {
        storage.setItem('options', JSON.stringify(data))
      }
    },
    timetable (state, data) {
      state.timetable = data

      if (!state.loading) {
        storage.setItem('timetable', JSON.stringify(data.map(session => {
          return {
            code: session.course.code,
            key: session.course.key,
            component: session.stream.component,
            time: session.time,
            index: session.index
          }
        })))
      }
    },
    webStreams (state, data) {
      state.webStreams = data

      if (!state.loading) {
        storage.setItem('webStreams', JSON.stringify(data))
      }
    },
    alert (state, data) {
      state.alert = data
    },
    loading (state, data) {
      state.loading = data
    },
    updateAvailable (state, data) {
      state.updateAvailable = data
    },
    serviceWorker (state, data) {
      state.serviceWorker = data
    }
  },
  actions: {
    loadData (context) {
      axios.get(dataURL).then((r) => {
        // Store data for use next time (if viewed offline)
        storage.setItem('courseData', JSON.stringify(r.data))

        // Commit to loaded data to store
        context.commit('courses', parseCourses(r.data.courses))
        context.commit('meta', r.data.meta)

        // Process loaded data
        try {
          processData(context, context.state.courses, r.data.meta)
        } catch (e) { console.error(e) }

        // After having loaded, disable the block on auto timetable updating
        // NB: this block exists to prevent restored timetable being overwritten
        window.setTimeout(() => context.commit('loading', false), 10)
      }).catch(() => {
        let pastData = storage.getItem('courseData')
        if (pastData) {
          let data = JSON.parse(pastData)

          // Commit to loaded data to store
          context.commit('courses', parseCourses(data.courses))
          context.commit('meta', data.meta)

          // Process loaded data
          try {
            processData(context, context.state.courses, data.meta)
          } catch (e) { console.error(e) }
        }
      })
    },
    reset (context) {
      context.commit('chosen', [ context.state.courses.CBS ])
      context.commit('events', [ 'The Bible Talks' ])
      context.commit('options', {})
      context.commit('timetable', [])
      context.commit('webStreams', [])
      context.commit('custom', [])
    },
    addCourse (context, course) {
      // Assign this course an unused color
      if (!course.color) {
        let used = context.state.chosen.map(course => course.color)
        course.color = choice(colors.filter(c => !used.includes(c)))
      }

      // Add this course and then sort the list of chosen courses
      const chosen = context.state.chosen
      let chosenCourses = chosen.slice(0, -1)
      chosenCourses.push(course)
      chosenCourses.sort((a, b) => {
        if (a.custom - b.custom !== 0) {
          return a.custom - b.custom
        }

        if (a.custom && b.custom) {
          a = a.title.toLowerCase()
          b = b.title.toLowerCase()
        } else {
          a = a.code.toLowerCase()
          b = b.code.toLowerCase()
        }

        return (a > b) - (a < b)
      })
      chosenCourses.push(chosen[chosen.length - 1])

      context.commit('chosen', chosenCourses)
    },
    removeCourse (context, course) {
      // Reset this course's color
      course.color = null

      // Reset WEB stream involvement for this course
      context.commit('webStreams', context.state.webStreams.filter(w => w !== course.key))

      if (course.custom) {
        // Remove from custom courses
        context.commit('custom', context.state.custom.filter(c => c.id !== course.key))
      }

      // Remove this course from list of chosen courses
      context.commit('chosen', context.state.chosen.filter(c => c !== course))
    },
    addCustom (context, custom) {
      // Convert into the usual course format
      let customCourse = {
        code: custom.id,
        key: custom.id,
        title: custom.name,
        custom: true,
        color: custom.color,
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

      // Add this new, customised course to our list of chosen courses
      context.dispatch('addCourse', customCourse)

      // Save the chosen color
      custom.color = customCourse.color
      context.commit('custom', context.state.custom)
    }
  },
  getters: {
    courses (state) {
      if (state.loading) {
        return {}
      } else {
        return state.courses
      }
    }
  }
})
