import type { CourseData } from '../../app/src/state/Course'

export type CampusAdditional<C extends string = string> = {
  default: CourseData<C>[],
  [term: string]: CourseData<C>[],
}
