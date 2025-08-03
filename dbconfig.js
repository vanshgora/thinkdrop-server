const { MongoClient } = require('mongodb');

let client;
let db;

async function connectToDB() {
    client = new MongoClient(process.env.MONGODB_CONNECTION_URI);
    console.log("Connecting to the db....");
    await client.connect();

    db = client.db('thinkdrop');
    console.log("Connected to MongoDB");
}

function getDb() {
    if (!db) {
        console.log("Not connected to db, connect to your db first");
        return
    }
    return db;
}

module.exports = { connectToDB, getDb };
