import CourseManager from "../state/CourseManager";
import { CourseListAction, ADD_COURSE, SET_COURSE_DATA, CourseAction, REMOVE_COURSE, OtherAction, CustomAction, ADD_CUSTOM, REMOVE_CUSTOM, UPDATE_CUSTOM } from "../actions";
import { CourseId, CustomCourse } from "../state";

export function courses (
  state: CourseManager | undefined,
  action: CourseListAction | CustomAction | OtherAction,
): CourseManager {
  if ([SET_COURSE_DATA, ADD_CUSTOM, REMOVE_CUSTOM, UPDATE_CUSTOM].includes(action.type)) {
    const cm = new CourseManager(state);

    if (action.type === SET_COURSE_DATA) {
      cm.update_official(action.courses);

      // Auto-select CBS as an additional course
      const cbs = cm.get('CBS');
      if (cbs && !cm.additional.includes(cbs)) {
        cm.update_additional([...cm.additional, cbs]);
      }
    }

    if (action.type === ADD_CUSTOM) {
      cm.update_custom([...cm.custom, action.custom]);
    } else if (action.type === REMOVE_CUSTOM) {
      const i = cm.custom.indexOf(action.custom);
      cm.update_custom([
        ...cm.custom.slice(0, i),
        ...cm.custom.slice(i + 1),
      ]);
    } else if (action.type === UPDATE_CUSTOM) {
      const i = cm.custom.indexOf(action.custom);
      cm.update_custom([
        ...cm.custom.slice(0, i),
        new CustomCourse({ ...cm.custom[i].data, ...action.newData }),
        ...cm.custom.slice(i + 1),
      ]);
    }

    return cm;
  }

  return state || new CourseManager();
};

export function chosen (
  state: CourseId[] = [],
  action: CourseAction | CourseListAction | OtherAction
): CourseId[] {
  switch (action.type) {
    case ADD_COURSE:
      return [
        ...state,
        action.course.id,
      ];
    case REMOVE_COURSE:
      const i = state.indexOf(action.course.id);
      return [
        ...state.slice(0, i),
        ...state.slice(i + 1),
      ];
    case SET_COURSE_DATA:
      // Only keep chosen courses which have current data
      // NB: this should only be necessary if a course stops being offered for a particular term
      //     after timetable data has been released (very unlikely)
      const newIds = new Set(action.courses.map(c => c.id));
      return state.filter(id => newIds.has(id));
  }

  return state;
};
