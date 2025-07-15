const http = require('node:http');
const path = require('node:path');
const fs = require('node:fs');
const dotenv = require('dotenv');
const connectToDB = require('./dbconfig');
const { addNewMail } = require('./controllers/controllers');

dotenv.config();

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    const { method, url } = req;

    if (method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const bodyData = JSON.parse(body);
            if (url === '/addnewmail') {
                addNewMail(bodyData, res);
            }
        });

    } else if (method === 'GET' && url === '/') {
        const filePath = path.join(__dirname, 'views', 'index.html');

        fs.readFile(filePath, (err, data) => {
            if (err) {
                console.log(err);
                res.writeHead(500);
                res.end('Error While Loading Page');
            } else {
                res.writeHead(200, { 'content-type': 'text/html' });
                res.end(data);
            }
        });
    }
});

server.listen(PORT, () => {
    console.log('Server is running on the port no.', PORT);
});