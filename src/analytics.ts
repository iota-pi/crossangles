import ReactGA from 'react-ga';

export const initialiseGA = () => {
  ReactGA.initialize('UA-101186620-1', {
    titleCase: false,
  });
}

export const pageView = () => {
  ReactGA.pageview(window.location.origin + window.location.pathname);
}

export const CATEGORY_COURSE_SELECTION = 'course_selection';
export const CATEGORY_TIMETABLE = 'timetable';
export const CATEGORY_UI = 'user_interface';
