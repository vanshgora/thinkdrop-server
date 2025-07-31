const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const connectToDB = require('./dbconfig');
const bcrypt = require('bcrypt');

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
    thinkdropDB = connectToDB();
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

        const newUserCreated = await users.insertOne({ name, email, preferredTime, password: encryptedPass });

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