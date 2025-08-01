const { MongoClient } = require('mongodb');

let client;
let db;

async function connectToDB() {
    if (db) return db;

    client = new MongoClient(process.env.MONGODB_CONNECTION_URI);
    console.log("Connecting to the db....");
    await client.connect();

    db = client.db('thinkdrop');
    console.log("Connected to MongoDB");
    return db;
}

module.exports = connectToDB;
