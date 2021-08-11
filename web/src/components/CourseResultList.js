import React from 'react';
import CourseResult from './CourseResult';


function CourseResultList({ filteredCourses }) {
    const filtered = filteredCourses
        .map(course => <CourseResult course={course} key={course._id}/>);
    return (
        <ul className="list pl0 mt0 measure center">
            {filtered}
        </ul>
    );
}

export default CourseResultList;