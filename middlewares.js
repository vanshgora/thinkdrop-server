const { verifyToken } = require("./script");

const authenticate = async (req, res, next) => {
    try {
        if (req.cookies && req.cookies.token) {
            const token = req.cookies.token.substring(7);
            const decoded = await verifyToken(token);
            if(decoded.acknowledged) {
                return res.status(401).json({ success: false, unAutherized: true, message: "Unautherized access" });
            }
            next();
        }
    } catch (err) {
        console.log("Error while authentication", err);
        return res.status(401).json({ success: false, message: "Internal Server Error" });
    }
}

module.exports = {
    authenticate
}