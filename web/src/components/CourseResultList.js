import React from 'react';
import CourseResult from './CourseResult';


function CourseResultList({ filteredCourses }) {
    const filtered = filteredCourses
        .map(course => <CourseResult course={course} key={course._id}/>);
    return (
        <div className="flex item-start flex-wrap justify-center">
            {filtered}
        </div>
    );
}

export default CourseResultList;