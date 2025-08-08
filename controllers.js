const { getDb } = require("./dbconfig");
const bcrypt = require('bcrypt');
const { generateJWTToken } = require('./script');

exports.signup = async (req, res) => {
    try {
        const { email, name, preferredTime, password } = req.body;

        const thinkdropDB = getDb();
        const users = thinkdropDB.collection('users');

        const isEmailExists = await users.findOne({ email: email });

        if (isEmailExists) {
            res.status(409).json({ success: false, message: "Email already exists and another mail" });
            return;
        }
        const encryptedPass = await bcrypt.hash(password, Number(process.env.SALT_ROUNDS));

        const newUserCreated = await users.insertOne({ name, email, preferredTime, password: encryptedPass, isServicePaused: false });

        if (!newUserCreated) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, message: "Internal server error" }));
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: true, message: 'User created successfully', user: newUserCreated }));
    } catch (err) {
        console.log(err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, message: "Internal server error" }));
    }

};

exports.login = async (req, res) => {
    try {

        const { email, password } = req.body;
        const thinkdropDB = getDb();
        const users = thinkdropDB.collection('users');

        const userFind = await users.findOne({ email });

        if (!userFind) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, message: "Email not found" }));
        }

        const isPasswordCorrect = await bcrypt.compare(password, userFind.password);

        if (!isPasswordCorrect) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, message: "Incorrect password" }));
        }

        const token = await generateJWTToken(userFind);

        res.setHeader('Set-Cookie', `token=bearer ${token}; HttpOnly; Path=/; SameSite=None; Secure; Max-Age=${2 * 30 * 24 * 60 * 60 * 1000}`)
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: true, message: "Login successfull", user: userFind }));

    } catch (err) {
        console.log("Error while login", err);
        res.writeHead(500, { 'Content-Type': "application/json" });
        return res.end(JSON.stringify({ success: false, message: "Internal server error" }));
    }
};

exports.reSchedule = async (req, res) => {
    try {
        const { email, preferredTime } = req.body;

        const thinkdropDB = getDb();
        const users = thinkdropDB.collection('users');

        const currentUser = await users.findOne({ email });

        const updatedUser = await users.findOneAndUpdate(
            { _id: currentUser._id },
            { $set: { preferredTime: preferredTime } },
            { returnDocument: 'after' }
        );

        if (!updatedUser) {
            res.writeHead(500, { 'Content-Type': "application/json" });
            return res.end(JSON.stringify({ success: false, message: "Internal server error" }));
        }

        res.writeHead(200, { 'Content-Type': "application/json" });
        return res.end(JSON.stringify({ success: true, message: "Time rescheduled successfully", user: updatedUser }));
    } catch (err) {
        res.writeHead(500, { 'Content-Type': "application/json" });
        return res.end(JSON.stringify({ success: false, message: "Internal server error" }));
    }
};

exports.updateEmailDelivery = async (req, res) => {
    try {
        const { email, isPaused } = req.body;

        const thinkdropDB = getDb();

        const users = thinkdropDB.collection('users');

        const currentUser = await users.findOne({ email });

        const updatedUser = await users.findOneAndUpdate(
            { _id: currentUser._id },
            { $set: { isPaused: isPaused } },
            { returnDocument: 'after' }
        );

        if (!updatedUser) {
            res.writeHead(500, { 'Content-Type': "application/json" });
            return res.end(JSON.stringify({ success: false, message: "Internal server error" }));
        }
        res.writeHead(200, { 'Content-Type': "application/json" });
        return res.end(JSON.stringify({ success: true, message: "Successfull", user: updatedUser }));
    } catch (err) {
        res.writeHead(500, { 'Content-Type': "application/json" });
        return res.end(JSON.stringify({ success: false, message: "Internal server error" }));
    }
};

exports.logout = async (req, res) => {
    try {
        res.setHeader('Set-Cookie', `token=; HttpOnly; Path=/; SameSite=None; Secure; Max-Age=0`)
        res.writeHead(204, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: true, message: "Logout Successfull" }));
    } catch (err) {
        console.log("Error while loging-out", err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, message: "Logout Unsuccessfull" }));
    }
}