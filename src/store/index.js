import axios from 'axios'

const dataURL = '/static/tt.json'

function parseTimetable (data, timetableRaw) {
  let timetable = []

  for (let i = 0; i < timetableRaw.length; i += 3) {
    timetable.push({
      time: data[3][timetableRaw[i]],
      location: data[2][timetableRaw[i + 1]],
      weeks: data[4][timetableRaw[i + 2]]
    })
  }

  return timetable
}

export default {
  state: {
    courseData: {},
    courses: [],
    events: [],
    options: []
  },
  mutations: {
    courseData (state, data) {
      let courses = {}

      for (let subj of Object.keys(data[0])) {
        for (let nums of Object.keys(data[0][subj])) {
          let code = subj + nums
          let title = data[0][subj][nums][0]
          let info = data[0][subj][nums].slice(1)
          courses[code] = {
            code,
            title,
            component: data[1][info[0]],
            status: !info[1],
            enrols: [info[2], info[3]],
            timetable: parseTimetable(data, info.slice(4))
          }
        }
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
