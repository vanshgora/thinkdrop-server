const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const { connectToDB } = require('./dbconfig');
const { signup, login, reSchedule, updateEmailDelivery } = require('./controllers');
const { authenticate } = require('./middlewares');
const cookieParser = require('cookie-parser');

dotenv.config();

const app = express();

let thinkdropDB;

app.use(cors({
    origin: 'https://thinkdrop-client.vercel.app',
    credentials: true
}));

app.use(cookieParser());

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

app.post('/users/signup', signup);
app.post('/users/login', login);
app.patch('/users/reschedule', authenticate, reSchedule);
app.patch('/users/update-email-delivery', authenticate, updateEmailDelivery);