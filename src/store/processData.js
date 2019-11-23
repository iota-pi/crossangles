const storage = window.localStorage

function processData (context, courses, meta) {
  let chosen = storage.getItem('chosen')
  let events = storage.getItem('events')
  let options = storage.getItem('options')
  let timetable = storage.getItem('timetable')
  let webStreams = storage.getItem('webStreams')
  let custom = storage.getItem('custom')

  let metaMatch = false
  let oldMeta = storage.getItem('meta')
  if (oldMeta) {
    oldMeta = JSON.parse(oldMeta)
    metaMatch = (oldMeta.year === meta.year) && (oldMeta.term === meta.term)
  }

  if (chosen && metaMatch) {
    // Restore previously chosen courses
    chosen = JSON.parse(chosen)
    let restored = []
    for (let i = 0; i < chosen.length; i++) {
      let course = chosen[i]
      if (!course.custom) {
        // NB: course.code is for backwards compatability with older stored data
        const key = course.key || course.code

        if (courses[key]) {
          courses[key].color = course.color
          restored.push(courses[key])
        }
      }
    }

    context.commit('chosen', restored)
  } else {
    // Default to just CBS chosen
    context.commit('chosen', [ courses.CBS ])
  }

  if (events) {
    // Restore previously selected events
    events = JSON.parse(events)
    context.commit('events', events)
  } else {
    // Default to all CBS events
    context.commit('events', [ 'The Bible Talks' ])
  }

  if (options) {
    // Restore previously selected options
    options = JSON.parse(options)
    context.commit('options', options)
  } else {
    // Default to none selected
    context.commit('options', {})
  }

  if (webStreams && metaMatch) {
    // Restore previously selected options
    webStreams = JSON.parse(webStreams)
    context.commit('webStreams', webStreams)
  } else {
    // Default to none selected
    context.commit('webStreams', [])
  }

  if (custom && metaMatch) {
    // Restore previously selected options
    custom = JSON.parse(custom)
    context.commit('custom', custom)
    for (let i = 0; i < custom.length; i++) {
      context.dispatch('addCustom', custom[i])
    }
  } else {
    // Default to none selected
    context.commit('custom', [])
  }

  if (timetable && metaMatch) {
    timetable = JSON.parse(timetable)

    let restored = []
    for (let i = 0; i < timetable.length; i++) {
      let item = timetable[i]

      // Get actual course object from its key
      // NB: item.code is for backwards compatability with older stored data
      let key = item.key || item.code
      let course = courses[key]
      if (course === undefined) {
        course = context.state.chosen.filter(c => c.key === key)[0]
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

        // Check this stream has a corresponding item
        if (s.sessions.length <= item.index) {
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

      if (stream) {
        restored.push(stream.sessions[item.index])
      }
    }

    context.commit('timetable', restored)
  } else {
    // Default to empty timetable
    context.commit('timetable', [])
  }
}

export default processData
