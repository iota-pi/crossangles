import {
  pink, deepPurple, indigo, blue, teal, lightGreen, amber, deepOrange,
} from '@mui/material/colors'
import { SessionManagerData } from './components/Timetable/SessionManager'
import { CourseMap } from './state'

export const migrations = {
  0: (state: any) => {
    // Change colours from simple strings to objects
    const colours: { [course: string]: any } = state.colours
    for (const c of Object.keys(colours)) {
      const COLOUR_MAP: { [colourName: string]: string } = {
        [pink[700]]: 'pink',
        [deepPurple[700]]: 'deepPurple',
        [indigo[700]]: 'indigo',
        [blue[700]]: 'blue',
        [teal[700]]: 'teal',
        [lightGreen[700]]: 'lightGreen',
        [amber[700]]: 'amber',
        [deepOrange[700]]: 'deepOrange',
      }
      if (typeof colours[c] === 'string') {
        const colour = (colours[c] as string).toLowerCase()
        colours[c] = COLOUR_MAP[colour]
      }
    }
    return {
      ...state,
      colours,
    }
  },
  1: (state: any) => {
    const meta = { ...state.meta }
    if (meta.sources === undefined) {
      meta.sources = []
      if (meta.source) {
        meta.sources.push(meta.source)
      }
    }
    delete meta.source
    return {
      ...state,
      meta,
    }
  },
  2: (state: any) => {
    const timetables = state.timetables
    for (const timetable of Object.values(timetables) as SessionManagerData[]) {
      timetable.renderOrder = timetable.order
    }
    return { ...state }
  },
  3: (state: any): any => {
    const { compactView, darkMode, reducedMotion, twentyFourHours, options, ...otherState } = state
    return {
      ...otherState,
      options: { ...options, compactView, darkMode, reducedMotion, twentyFourHours },
    }
  },
  4: (state: any): any => {
    // Ensure times has a non-null value, replace with an empty array instead
    const courses: CourseMap = state.courses
    const newCourses: CourseMap = {}
    for (const [code, course] of Object.entries(courses)) {
      const streams = course.streams.map(stream => ({
        ...stream,
        times: stream.times || [],
      }))
      newCourses[code] = { ...course, streams }
    }
    return { ...state, courses: newCourses }
  },
  5: (state: any): any => {
    // Change of times for term 3, 2021
    const term = '2021~T3'
    const timetable: SessionManagerData | undefined = state.timetables[term]
    if (timetable !== undefined) {
      const newTimetable: SessionManagerData = { ...timetable }
      const updateIds: { [id: string]: string } = {
        'CBS~Growth Groups~M13-14.5': 'CBS~Growth Groups~M13',
        'CBS~Growth Groups~T11-12.5': 'CBS~Growth Groups~T11',
        'CBS~Growth Groups~W11-12.5': 'CBS~Growth Groups~W12',
        'CBS~Growth Groups~H10-11.5': 'CBS~Growth Groups~H10',
        'CBS~Growth Groups~F11-12.5': 'CBS~Growth Groups~F11',
        'CBS~The Bible Talks~T13': 'CBS~The Bible Talks~T12',
        'CBS~The Bible Talks~H12': 'CBS~The Bible Talks~H11',
      }
      newTimetable.map = newTimetable.map.map(([id, placement]) => {
        const oldStream = placement.session.stream
        const newStream = updateIds[oldStream] || oldStream
        if (newStream) {
          const newPlacement: typeof placement = {
            ...placement,
            session: {
              ...placement.session,
              stream: newStream,
            },
          }
          return [id, newPlacement]
        }
        return [id, placement]
      })
      newTimetable.order = newTimetable.order.map(id => updateIds[id] || id)
      newTimetable.renderOrder = newTimetable.renderOrder.map(id => updateIds[id] || id)
      return {
        ...state,
        timetables: { ...state.timetables, [term]: newTimetable },
      }
    }
    return state
  },
}

export default migrations
