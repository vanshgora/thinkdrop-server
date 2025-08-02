const jwt = require('jsonwebtoken');

const generateJWTToken = async (newUserCreated) => {
    return new Promise((resolve, reject) => {
        jwt.sign(newUserCreated, process.env.JWT_SECRET, (err, token) => {
            if (err) reject(err);
            else resolve(token);
        });
    });
}

module.exports = { generateJWTToken }