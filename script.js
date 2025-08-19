const jwt = require('jsonwebtoken');
const { spawn } = require('node:child_process');
const nodemailer = require('nodemailer');

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

const generateOTP = () => {
    const otp = Math.floor(Math.random() * 1000000);
    return otp;
}

const sendResetPasswordOTPMail = async (to, otp) => {
    if (!process.env.GMAIL_PASS) {
        console.error("Password missing!");
        return;
    }

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
        },
    });

    const mailOptions = {
        from: `"ThinkDrop Support" <${process.env.GMAIL_USER}>`,
        to,
        subject: "Your ThinkDrop OTP for Password Reset",
        html: `
        <div style="font-family: Arial, sans-serif; background:#f9f9f9; padding:20px;">
          <div style="max-width:600px; margin:auto; background:#ffffff; padding:30px; border-radius:10px; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
            
            <h2 style="color:#1B263B; text-align:center;">ThinkDrop Password Reset</h2>
            <p style="font-size:16px; color:#333;">
              We received a request to reset your ThinkDrop account password. Use the OTP below to complete the process:
            </p>

            <div style="text-align:center; margin:30px 0;">
              <span style="font-size:28px; font-weight:bold; color:#FFD700; letter-spacing:4px; display:inline-block; padding:12px 20px; border:2px dashed #FFD700; border-radius:8px;">
                ${otp}
              </span>
            </div>

            <p style="font-size:15px; color:#555;">
              This OTP is valid for <strong>15 minutes</strong>. Please do not share it with anyone.
            </p>

            <p style="font-size:14px; color:#999; margin-top:30px;">
              If you didn’t request a password reset, you can safely ignore this email.
            </p>

            <p style="font-size:14px; color:#1B263B; text-align:center; margin-top:40px;">
              — The ThinkDrop Team
            </p>
          </div>
        </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent:", info.messageId);
    } catch (err) {
        console.error("Error sending mail:", err.message);
    }
};

const getRquestParams = async (url) => {

}

module.exports = { generateJWTToken, verifyToken, getRequestBody, configCors, parseCookie, generateTunnelingURL, generateOTP, sendResetPasswordOTPMail }