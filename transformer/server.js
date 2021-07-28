const fs = require('fs')
const path = require('path')
const { Client } = require('@elastic/elasticsearch')
const PromiseThrottle = require('promise-throttle');
const axios = require('axios').default;

const filePath = path.join(__dirname, '..', 'data', 'Kurse.json')
const INDEX_NAME = 'kurse'

async function readData() {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, { encoding: 'utf-8' }, function (err, data) {
            if (!err) {
                const raw = JSON.parse(data);
                resolve(raw.veranstaltungen.veranstaltung)
            } else {
                reject(err)
            }
        });
    })
}

async function readMapping() {
    return new Promise((resolve, reject) => {
        fs.readFile('./mapping.json', { encoding: 'utf-8' }, function (err, data) {
            if (!err) {
                const raw = JSON.parse(data);
                resolve(raw)
            } else {
                reject(err)
            }
        });
    })
}

function cleanAddress(address) {
    const replacements = [
        {orig: "Goethestr. 9-11 (Lichterfelde)", replacement: "Goethestr. 9-11"},
        {orig: "Berliner Allee 60, 13088 Berlin", replacement: "Berliner Allee 60"},
        {orig: "Ella-Barowsky-Str. 62, 10829 Berlin", replacement: "Ella-Barowsky-Str. 62"},
        {orig: "Im Kienbergpark direkt am Wuhleteich", replacement: "Rohrbruchpark"},
        {orig: "Hermannstr. 158 A (Eingang Arztpraxen)", replacement: "Hermannstr. 158"},
        {orig: "Weidenweg 62 HH", replacement: "Weidenweg 62"},
        {orig: "Fuchssteiner Weg 13 - 19, Hofeingang", replacement: "Fuchssteiner Weg 13"},
        {orig: "Fürstenwalder Allee 362/Lutherstraße", replacement: "Fürstenwalder Allee 362"},
        {orig: "Nürnberger Straße 63 (durch Toreinfahrt)", replacement: "Nürnberger Straße 63"},
        {orig: "Alt-Mariendorf 43 (Hofeingang)", replacement: "Alt-Mariendorf 43"},
        {orig: "über Eingang Buckower Damm", replacement: "Buckower Damm"},
        {orig: "Prinzenallee 25/26, 3. Hinterhof, EG", replacement: "Prinzenallee 25/26"},
        {orig: "Aroser Allee 170, Eingang Thurgauer Str.", replacement: "Aroser Allee 170"},
        {orig: "Hüttenweg 40 (über Schulhof Taylorstr.)", replacement: "Hüttenweg 40"},
        {orig: "Herwartstr. gegenüber Hausnummer 3", replacement: "Herwartstr. 3"},
        {orig: "Zellestr. 12, Raum 410", replacement: "Zellestr. 12"},
        {orig: "An der Dorfkirche, Tor rechts neben Nr.5", replacement: "An der Dorfkirche, Tor rechts neben Nr.5"},
        {orig: "Hofeingang gegenüber Stolbergstr 5L", replacement: "Stolbergstr 5L"},
        {orig: "Glendelin, Dorfstraße 14", replacement: "Dorfstraße 14"},
        {orig: "Mülllerstr. 47", replacement: "Müllerstr. 47"},
        {orig: "Lehderstraße 74-79", replacement: "Lehderstraße 74"},
        {orig: "Aronsstraße134", replacement: "Aronsstraße 134"},
        {orig: "Karl-Marx-Str. 83", replacement: "Karl-Marx-Straße 83"},
        {orig: "Rhinstr. 09", replacement: "Rhinstraße 9"},
    ]

    const match = replacements.find(r => r.orig === address.strasse);
    return {
        land: address.land,
        plz: address.plz,
        ort: address.ort,
        fixedStreet: match ? match.replacement : address.strasse,
        strasse: address.strasse
    } 
    
    ;
} 

function getUniqueLocations(data) {
    const locations = {};
    data.forEach(course => {
        const key = JSON.stringify(course.veranstaltungsort);
        if (!locations[key]) {
            locations[key] = cleanAddress(course.veranstaltungsort.adresse);
            locations[key].count = 1;
        } else {
            locations[key].count += 1;
        }
    });
    return locations;
}

async function geocodeLocations(locations) {
    let promiseThrottle = new PromiseThrottle({
        requestsPerSecond: 100,         // up to 1 request per second
        promiseImplementation: Promise  // the Promise library you are using
    });


    return promiseThrottle.addAll(Object.values(locations).map(location => {
        return async () => {
            if (!location.plz) {
                // online course doesn't have address
                return
            }
            const res = await axios.get('http://localhost:8080/search.php', {
                params: {
                    street: location.fixedStreet,
                    city: location.ort,
                    country: location.land,
                    postalcode: location.plz
                }
            })
            const match = res.data[0];
            if (!match) {
                console.log('no geo data for', JSON.stringify(location))
                return
            } 
            location.location = {
                lat: +match.lat,
                lon: +match.lon
            }
        }
    }));
}

async function geocode(data) {
    const locations = getUniqueLocations(data);
    await geocodeLocations(locations);

    data.forEach(course => {
        const key = JSON.stringify(course.veranstaltungsort);
        course.veranstaltungsort.adresse = locations[key];
    });
}

function connect() {
    const client = new Client({
        node: 'http://localhost:9200',
        auth: {
            username: 'elastic',
            password: 'changeme'
        },
        ssl: {
            ssl_no_validate: true
        }
    });
    console.log('connected');
    return client;
}

async function indexDocuments(client, dataset) {
    const body = dataset.flatMap(doc => [{ index: { _index: INDEX_NAME } }, doc])
    const { body: bulkResponse } = await client.bulk({ refresh: true, body });
    const { body: count } = await client.count({ index: INDEX_NAME })
    console.log(count)
}

async function setUp() {
    try {
        const client = connect()
        if (await client.indices.exists({ index: INDEX_NAME })) {
            await client.indices.delete({ index: INDEX_NAME });
        }

        const mapping = await readMapping();
        await client.indices.create({ index: INDEX_NAME, body: mapping });

        const data = await readData()
        await geocode(data)
        await indexDocuments(client, data);
    } catch (err) {
        console.log(err)
    }
}

setUp();
