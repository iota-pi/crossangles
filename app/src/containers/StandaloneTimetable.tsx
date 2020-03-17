import React, { useState, useEffect } from 'react';
import TimetableTable from '../components/Timetable';
import { parseQueryString } from '../saveAsImage';
import SessionManager from '../components/Timetable/SessionManager';
import { CourseMap, getCourseId } from '../state/Course';
import requestData from '../requestData';
import { CssBaseline } from '@material-ui/core';


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
        options={queryData.options}
        colours={queryData.colours}
        timetable={timetable}
        minimalHours
        isStandalone
      />
    </div>
  );
}

export default StandaloneTimetable;
