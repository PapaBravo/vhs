const fs = require('fs')
const path = require('path')
const { Client } = require('@elastic/elasticsearch')

const filePath = path.join(__dirname, '..', 'data', 'Kurse.json')
const INDEX_NAME = 'kurse'

async function readData() {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, { encoding: 'utf-8' }, function (err, data) {
            if (!err) {
                const raw = JSON.parse(data);
                resolve(raw)
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
        if (await client.indices.exists({ index: INDEX_NAME })){
            await client.indices.delete({ index: INDEX_NAME });
        }

        const mapping = await readMapping();
        await client.indices.create({ index: INDEX_NAME, body: mapping });

        const data = await readData()
        await indexDocuments(client, data.veranstaltungen.veranstaltung);
    } catch (err) {
        console.log(err)
    }
}

setUp();
