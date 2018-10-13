import axios from 'axios'

const dataURL = '/static/tt.json'

function parseClasses (data, classData) {
  let result = []

  for (let i = 0; i < classData.length; i += 3) {
    let comp = classData[i]
    result.push({
      component: data[1][comp[0]],
      status: !comp[1],
      enrols: [comp[2], comp[3]],
      timetable: parseTimetable(data, comp.slice(4))
    })
  }

  return result
}

function parseTimetable (data, timetableRaw) {
  let timetable = []

  for (let i = 0; i < timetableRaw.length; i += 3) {
    timetable.push({
      location: data[2][timetableRaw[i + 1]],
      time: parseTimeString(data[3][timetableRaw[i]]),
      weeks: data[4][timetableRaw[i + 2]]
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
    timetable: {}
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
            classes: parseClasses(data, info)
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
