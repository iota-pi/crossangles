import axios from 'axios'

const dataURL = '/static/tt.json'

function parseStreams (data, classData, course) {
  let result = []

  for (let i = 0; i < classData.length; i += 3) {
    let comp = classData[i]
    let stream = {
      course: course,
      component: data[1][comp[0]],
      status: !comp[1],
      enrols: [comp[2], comp[3]],
      timetable: null
    }
    stream.timetable = parseTimetable(data, comp.slice(4), course, stream)
    result.push(stream)
  }

  return result
}

function parseTimetable (data, timetableRaw, course, stream) {
  let timetable = []

  for (let i = 0; i < timetableRaw.length; i += 3) {
    timetable.push({
      location: data[2][timetableRaw[i + 1]],
      time: parseTimeString(data[3][timetableRaw[i]]),
      weeks: data[4][timetableRaw[i + 2]],
      course: course,
      stream: stream,
      index: Math.floor(i / 3),
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

      for (let subj of Object.keys(data[0])) {
        for (let nums of Object.keys(data[0][subj])) {
          let code = subj + nums
          let title = data[0][subj][nums][0]
          let info = data[0][subj][nums].slice(1)
          courses[code] = {
            code,
            title,
            streams: null
          }
          courses[code].streams = parseStreams(data, info, courses[code])
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
