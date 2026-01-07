import { StreamData } from './Stream'
import { MinistryMeta } from './Meta'
import { Colour } from './Colours'

export type CourseId = string

export enum Career {
  UGRD = 1,
  PGRD = 2,
  RSCH = 3,
}

export interface CourseData<C extends string = string> {
  code: string,
  name: string,
  streams: StreamData<C>[],
  term?: string,
  section?: string,
  career?: Career,
  isCustom?: boolean,
  isAdditional?: boolean,
  autoSelect?: boolean,
  defaultColour?: Colour,
  description?: string,
  metadata?: MinistryMeta,
  lowerCode?: string,
}

export interface CourseMap {
  [id: string]: CourseData,
}


export function getCourseId(course: CourseData, simple = false): CourseId {
  const extraSegments = [
    course.code,
    course.term,
    !simple && course.section,
    !simple && careerToString(course.career),
  ]
  return extraSegments.filter(x => !!x).join('~')
}

export function careerToString(career?: Career): string | undefined {
  if (career === Career.PGRD) {
    return 'PGRD'
  } else if (career === Career.RSCH) {
    return 'RSCH'
  } else if (career === Career.UGRD) {
    return ''
  }
  return undefined
}

export function careerToName(career?: Career): string | undefined {
  if (career === Career.PGRD) {
    return 'Postgrad'
  } else if (career === Career.RSCH) {
    return 'Research'
  } else if (career === Career.UGRD) {
    return 'Undergrad'
  }
  return undefined
}

export function getWebStream(course: CourseData): StreamData | null {
  const streams = course.streams
  for (let i = 0; i < streams.length; ++i) {
    if (streams[i].web) {
      return streams[i]
    }
  }

  return null
}

export const hasWebStream = (course: CourseData): boolean => getWebStream(course) !== null

export function getComponents(course: CourseData): string[] {
  const components = course.streams.map(s => s.component)
  return components.filter((c, i) => components.indexOf(c) === i)
}

export function getClarificationText(course: CourseData): string {
  const disciplineRegex = /\b[A-Z]{4}\b/g
  const disciplines: string[] = []
  const maxMatches = 10
  if (course.description) {
    for (let i = 0; i < maxMatches; ++i) {
      const match = disciplineRegex.exec(course.description)
      if (match === null) break
      disciplines.push(match[0])
    }
  }

  const discipline = disciplines.join(', ') || undefined
  const career = course.career !== Career.UGRD ? careerToName(course.career) : undefined
  const parts = [discipline || course.section, course.term, career]
  return parts.filter(x => x).join('; ')
}

export const courseSort = (a: CourseData, b: CourseData) => +(a.code > b.code) - +(a.code < b.code)
export const customSort = (a: CourseData, b: CourseData) => +(a.name > b.name) - +(a.name < b.name)
