import React from 'react';

function CourseResult({ course }) {
  const c = course._source;
  const keywords = c?.schlagwort?.join?.(' | ') ?? c?.schlagwort;
  return (
    <li className="pa1 pa2-ns bb relative">
      <b className="db f3 mb1">{c.name}</b>
      <span className="f5 db lh-copy measure">{c.untertitel}</span>
      <span className="f5 db lh-copy measure courier">{keywords}</span>
      <a className="absolute top-0 right-0"
        href={c.webadresse.uri} target="_blank" rel="noopener noreferrer">
        <img
          alt="Go to course"
          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAAkklEQVRIie2VQQqAIBQFh+5QdKSuUsetRfs8SG2Mgur7UmvlgLjxvRERhcJLOsABqzF2lDUXlkAwWRBccEMNjF8JGmDymX3OJjjvfAbanIK7cimvCJ7KswiscglLkFxuCdTyqCN6s/MowcBxzxsrHCsA6IXyJIHKJV8llEn8LnB+Dj3Z1jPtMOjQ/oSnsfiOgs4GdhCGDgYn7KYAAAAASUVORK5CYII=" />
      </a>
    </li>
  );
}

export default CourseResult;