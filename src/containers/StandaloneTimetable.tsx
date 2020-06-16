import React, { useState, useEffect } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import TimetableTable from '../components/Timetable';
import { CourseMap, getCourseId } from '../state';
import SessionManager from '../components/Timetable/SessionManager';
import requestData from '../requestData';
import { parseQueryString } from '../saveAsImage';


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
    }

    loadData();
  }, [])

  return (
    <div>
      <CssBaseline />
      <TimetableTable
        timetable={timetable}
        options={queryData.options}
        colours={queryData.colours}
        darkMode={queryData.darkMode}
        compactView={queryData.compactView}
        disableTransitions={true}
        minimalHours
        isStandalone
      />
    </div>
  );
}

export default StandaloneTimetable;
