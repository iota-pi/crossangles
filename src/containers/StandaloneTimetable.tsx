import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@material-ui/core/styles/';
import CssBaseline from '@material-ui/core/CssBaseline';
import { TimetableTable } from '../components/Timetable';
import SessionManager from '../components/Timetable/SessionManager';
import { parseQueryString } from '../saveAsImage';
import { requestData } from '../requestData';
import { CourseMap, getCourseId, getOption, Options } from '../state';
import { theme } from '../theme';


export interface Props {
  courses: CourseMap,
}

const queryData = parseQueryString(window.location.search);

export const StandaloneTimetable = () => {
  const [timetable, setTimetable] = useState(new SessionManager());

  useEffect(() => {
    const loadData = async () => {
      const data = await requestData();
      const newCourses: CourseMap = {};
      for (const course of data.courses) {
        const id = getCourseId(course);
        newCourses[id] = course;
      }

      setTimetable(SessionManager.from(queryData.timetable, newCourses));
    };

    loadData();
  }, []);

  const options: Options = { ...queryData.options, reducedMotion: true };

  return (
    <ThemeProvider theme={theme(getOption(queryData.options, 'darkMode'))}>
      <CssBaseline />
      <TimetableTable
        timetable={timetable}
        options={options}
        colours={queryData.colours}
        minimalHours
        isStandalone
      />
    </ThemeProvider>
  );
};

export default StandaloneTimetable;
