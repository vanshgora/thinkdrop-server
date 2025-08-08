const { verifyToken } = require("./script");

const authenticate = async (req, res) => {
    try {
        if (req.cookies && req.cookies.token) {
            const token = req.cookies.token.substring(7);
            const decoded = await verifyToken(token);
            if (decoded.acknowledged) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, unAutherized: true, message: "Unautherized access" }));
                return false;
            }

            return true;
        }
    } catch (err) {
        console.log("Error while authentication", err);
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: "Internal Server Error" }));
        return false;
    }
}

module.exports = {
    authenticate
}