const jwt = require('jsonwebtoken');
const { spawn } = require('node:child_process');

const generateJWTToken = async (payload) => {
    return new Promise((resolve, reject) => {
        jwt.sign(payload, process.env.JWT_SECRET, (err, token) => {
            if (err) reject(err);
            else resolve(token);
        });
    });
};

const verifyToken = async (token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) reject(err);
            else resolve(decoded);
        })
    })
};

function getRequestBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            const parsedBody = JSON.parse(body);
            req.body = parsedBody;
            resolve(parsedBody);
        });

        req.on('error', err => {
            reject(err);
        });
    });
}

const parseCookie = (req) => {
    if (req.headers.cookie) {
        const cookies = req.headers.cookie.split(';');
        const parsedCookies = {};
        cookies.map(cookie => {
            const elem = cookie.trim().split('=');
            parsedCookies[elem[0]] = elem[1];
        });

        req.cookies = parsedCookies;
    }
}

const configCors = (origin, req, res) => {
    let isPreFlight = false;
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        isPreFlight = true;
    }

    return isPreFlight;
}

const generateTunnelingURL = async () => {
    const tunnel = spawn("cloudflared", ["tunnel", "--url", "http://localhost:3000"]);

    tunnel.stdout.on("data", (data) => {
        const text = data.toString();
        console.log("Tunnel Output:", text);

        const match = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
        if (match) {
            const tunnelUrl = match[0];
            console.log("Tunnel URL:", tunnelUrl);
        }
    });

    tunnel.stderr.on("data", (data) => {
        console.error(`Error: ${data}`);
    });

    tunnel.on("close", (code) => {
        console.log(`Tunnel process exited with code ${code}`);
    });
}

const getRquestParams = async (url) => {

}

module.exports = { generateJWTToken, verifyToken, getRequestBody, configCors, parseCookie, generateTunnelingURL }