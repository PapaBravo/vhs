import React from 'react';

function CourseResult({course}) {
    let c = course._source;
  return(
    <div className="tc bg-light-green dib br3 pa3 ma2 grow bw2 shadow-5">
      <div>
        <p>{c.name}</p>
      </div>
    </div>
  );
}

export default CourseResult;