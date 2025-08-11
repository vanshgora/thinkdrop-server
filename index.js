const dotenv = require('dotenv');
const http = require('node:http');
const { connectToDB } = require('./dbconfig');
const { signup, login, reSchedule, updateEmailDelivery, logout } = require('./controllers');
const { getRequestBody, parseCookie, generateTunnelingURL } = require('./script');
const { authenticate } = require('./middlewares');

async function startServer() {
    dotenv.config();

    const PORT = process.env.PORT || 3000;
    const HOST = process.env.HOST || '127.0.0.1';

    const server = http.createServer({ connectionsCheckingInterval: 20000 });

    server.on('request', async (req, res) => {
        const methord = req.method;
        const url = req.url;

        res.setHeader('Access-Control-Allow-Origin', 'https://thinkdrop-client.vercel.app');
        // res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, HEAD, OPTIONS, DELETE');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (methord === 'OPTIONS') {
            res.writeHead(204);
            return res.end();
        }

        if (methord !== 'GET') await getRequestBody(req);

        parseCookie(req);

        switch (methord) {
            case 'GET':
                break;
            case 'POST':
                switch (url) {
                    case '/users/signup':
                        signup(req, res);
                        break;
                    case '/users/login':
                        login(req, res);
                        break;
                    case '/users/logout':
                        {
                            const isAuthenticated = await authenticate(req, res);
                            if (!isAuthenticated) return;
                            logout(req, res);
                        }
                        break;
                }
                break;
            case 'PATCH':
                switch (url) {
                    case '/users/reschedule':
                        {
                            const isAuthenticated = await authenticate(req, res);
                            if (!isAuthenticated) return;
                            reSchedule(req, res);
                        }
                        break;
                    case '/users/update-email-delivery':
                        {
                            const isAuthenticated = await authenticate(req, res);
                            if (!isAuthenticated) return;
                            updateEmailDelivery(req, res);
                        }
                        break;
                }
                break;
            case 'DELETE':
                switch (url) {
                }
                break;
        }
    });

    await connectToDB();

    server.listen(PORT, () => {
        console.log('Server is listening on port no.', PORT);
    });
}

startServer();