const { MongoClient } = require('mongodb');

function connectToDB() {
    const client = new MongoClient(process.env.MONGODB_CONNECTION_URI);
    const database = client.db('thinkdrop');
    client.on('connectionCreated', () => {
        console.log("Connection established with mongodb server");
    });
    return database;
}

module.exports = connectToDB;