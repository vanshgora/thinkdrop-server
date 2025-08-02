const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const connectToDB = require('./dbconfig');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateJWTToken } = require('./script');

dotenv.config();

const app = express();

let thinkdropDB;

app.use(cors({
    origin: 'https://thinkdrop-client.vercel.app',
    credentials: true
}));

app.use(express.json());

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '127.0.0.1';

app.listen(PORT, () => {
    console.log('Server listening on', PORT);
    connectToDB().then((val) => {
        thinkdropDB = val;
    });
});

app.get('/', (req, res) => {
    console.log("Someone knows your server address");
    res.send("Server is running");
});

app.post('/users/signup', async (req, res) => {
    try {
        const { email, name, preferredTime, password } = req.body;
        const users = thinkdropDB.collection('users');

        const isEmailExists = await users.findOne({ email: email });

        if (isEmailExists) {
            res.status(409).json({ success: false, message: "Email already exists and another mail" });
            return;
        }

        const encryptedPass = await bcrypt.hash(password, Number(process.env.SALT_ROUNDS));

        const newUserCreated = await users.insertOne({ name, email, preferredTime, password: encryptedPass, isServicePaused: false, createdAt: new Date() });

        const token = `Bearer ${await generateJWTToken(newUserCreated)}`;

        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 30 * 2,
            secure: false
        });

        if (!newUserCreated) {
            return res.status(500).send({ success: false, message: "Internal server error" });
        }

        return res.status(200).json({ success: true, message: 'User created successfully', user: newUserCreated });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ success: false, message: "Internal server error" });
    }

});

app.post('/users/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const users = thinkdropDB.collection('users');

        const userFind = await users.findOne({ email });

        if (!userFind) {
            return res.status(404).json({ success: false, message: "Email not found" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, userFind.password);

        if (!isPasswordCorrect) {
            return res.status(401).json({ success: false, message: "Incorrect password" });
        }

        return res.status(200).json({ success: true, message: "Login successfull", user: userFind });

    } catch (err) {
        console.log("Error while login", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }

});

app.patch('/users/reschedule', async (req, res) => {
    try {
        const { email, preferredTime } = req.body;

        const users = thinkdropDB.collection('users');

        const currentUser = await users.findOne({ email });

        const updatedUser = await users.findOneAndUpdate(
            { _id: currentUser._id },
            { $set: { preferredTime: preferredTime } },
            { returnDocument: 'after' }
        );

        if (!updatedUser) {
            return res.status(500).json({ success: false, message: "Internal server error" });
        }

        return res.status(200).json({ success: true, message: "Time rescheduled successfully", user: updatedUser });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
});

app.patch('/users/update-email-delivery', async (req, res) => {
    try {
        const { email, isPaused } = req.body;

        const users = thinkdropDB.collection('users');

        const currentUser = await users.findOne({ email });

        const updatedUser = await users.findOneAndUpdate(
            { _id: currentUser._id },
            { $set: { isPaused: isPaused } },
            { returnDocument: 'after' }
        );

        if (!updatedUser) {
            return res.status(500).json({ success: false, message: "Internal server error" });
        }

        return res.status(200).json({ success: true, message: "Successfull", user: updatedUser });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
})