import React, { useState, useEffect } from 'react';
import Scroll from './Scroll';
import CourseResultList from './CourseResultList';
import CourseMap from './CourseMap';

const baseUrl = 'https://memory-optimized-deployment-e09c4a.es.eu-central-1.aws.cloud.es.io:9243'

const fields = [
    'name',
    'name.typeAhead',
    'untertitel',
    'untertitel.typeAhead',
    'schlagwort^10',
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
    let req = await fetch(`${baseUrl}/kurse/_search`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'ApiKey blNWSVRuc0JPSlRLQkhzTk03eXA6TUVvUHpTM0NUa2EtS3VhWUZtUVp1QQ'
        },
        body: JSON.stringify(query)
    });
    let res = await req.json();
    return res.hits.hits;
}

function Search() {
    const [results, setResults] = useState([]);

    const handleChange = (e => searchCourses(e.target.value).then(setResults));

    useEffect(() => searchCourses('').then(setResults), []);

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
        <div className="flex flex-column helvetica">
            <section className="w-100 pa2">
                <div className="ma0">
                    <h2 className="f2">VHS Berlin Course Search</h2>
                    <p>
                        The <a href="https://www.berlin.de/vhs/">official VHS page</a>
                        offers a very detailed but cumbersome search.
                        It specifically does not give good feedback
                        on the location of courses
                        even though that is very important for many people.
                    </p>
                    <p>
                        This page is a tech demo
                        to show that a better search of VHS courses is possible.
                        It uses the powerful <a href="https://www.elastic.co/elasticsearch/">Elasticsearch</a> engine.
                    </p>
                    <p>
                        The source code and some documentation can be found on <a href="https://github.com/PapaBravo/vhs">github</a>.
                    </p>
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
                <section className="w-two-thirds pa2">
                    {courseMap()}
                </section>
            </section>

        </div>
    );
}

export default Search;