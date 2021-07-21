import React from 'react';

function CourseResult({ course }) {
  let c = course._source;
  return (
    <div className="tc dib br3 pa3 ma2 grow mw7 bg-washed-yellow bw2 shadow-5">
      <div>
        <h3>{c.name}</h3>
        <h4>{c.untertitel}</h4>

        {
          c.text.map(t => <p>{t.text}</p>)
        }
        <p>{c.schlagwort.join(' | ')}</p>
        <a href={c.webadresse.uri} target="_blank" rel="noopener noreferrer">{c.webadresse.name}</a>

      </div>
    </div>
  );
}

export default CourseResult;