import React, { useState } from 'react';
import Scroll from './Scroll';
import CourseResultList from './CourseResultList';
import CourseMap from './CourseMap';

const fields = [
    'name',
    'name.typeAhead',
    'untertitel',
    'untertitel.typeAhead',
    'schlagwort^3',
    'schlagwort.typeAhead',
];
// TODO add text arrays

function buildQuery(userQuery) {
    if (!userQuery) {
        return { "query": { "match_all": {} } };
    }
    let query = {
        'query': {
            "multi_match": {
                type: 'cross_fields',
                query: userQuery,
                fields: fields
            }
        }
    };

    return query;
}

async function searchCourses(userQuery) {
    const query = buildQuery(userQuery);
    let req = await fetch('http://localhost:9200/kurse/_search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(query)
    });
    let res = await req.json();
    return res.hits.hits;
}

function Search() {
    const [results, setResults] = useState([]);

    const handleChange = e => {
        searchCourses(e.target.value)
            .then(res => setResults(res));
    };

    function searchList() {
        return (
            <Scroll>
                <CourseResultList filteredCourses={results}></CourseResultList>
            </Scroll>
        );
    }

    function courseMap() {
        return (
            <CourseMap filteredCourses={results}></CourseMap>
        )
    }

    return (
        <div className="garamond flex flex-column h-100">
            <section className="w-100 pa2">
                <div className="navy georgia ma0">
                    <h2 className="f2">Search your course</h2>
                </div>
                <div className="pa2">
                    <input
                        className="pa3 bb br3 b--none bg-lightest-blue ma3"
                        type="search"
                        placeholder="Search Course"
                        onChange={handleChange}
                    />
                </div>
            </section>
            <section className="flex items-start relative">
                <section className="w-third pa2">
                    {searchList()}
                </section>
                <section className="w-two-thirds pa2 outline">
                    {courseMap()}
                </section>
            </section>

        </div>
    );
}

export default Search;