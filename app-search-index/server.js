const fs = require('fs')
const path = require('path')

const AppSearchClient = require('@elastic/app-search-node')
const APP_SEARCH_KEY = 'private-cmcsp9treii1b9qw3bxsh37z'

const filePath = path.join(__dirname, '..', 'data', 'Kurse.json')
const INDEX_NAME = 'kurse'
const ENGINE_NAME = 'vhs-courses-engine'

const baseUrlFn = () => 'http://localhost:3002/api/as/v1/'

async function readData() {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, { encoding: 'utf-8' }, function (err, data) {
            if (!err) {
                const raw = JSON.parse(data);
                resolve(raw)
            } else {
                reject(err);
            }
        });
    })
}

async function indexDocuments(dataset) {
    const client = new AppSearchClient(undefined, APP_SEARCH_KEY, baseUrlFn)

    const batchSize = 100;
    let batchNumber = 1;
    const totalBatches = Math.ceil(dataset.length / batchSize);

    try {
        while (batchNumber * batchSize <= dataset.length) {
            console.log(`starting with batch ${batchNumber}/${totalBatches}`)
            const batch = dataset.slice((batchNumber - 1) * batchSize, batchNumber * batchSize);
            const res = await client.indexDocuments(ENGINE_NAME, batch)
            batchNumber++
        }
    } catch (err) {
        console.error('error when indexing document', err)
    }

}


async function addData() {
    const data = await readData()
    await indexDocuments(data.veranstaltungen.veranstaltung);
}

addData();
