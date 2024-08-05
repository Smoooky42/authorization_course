const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
require('dotenv').config()
const { MongoClient } = require('mongodb');
const router = require('./router/index')
const mongoose = require("mongoose");
const errorMiddleware = require("./middlewares/errorMiddleware");


port = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL
}));
app.use('/api', router);
app.use(errorMiddleware);


const start = async () => {
    try {
        await mongoose.connect(process.env.DB_URL).then(() => {
            console.log("Подключение установлено", process.env.DB_URL);
        })
        app.listen(port, () => console.log(`Server started on port ${port}`));
    } catch (e) {
        console.log(e);
    }
}

start();