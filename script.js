const jwt = require('jsonwebtoken');

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

module.exports = { generateJWTToken, verifyToken }