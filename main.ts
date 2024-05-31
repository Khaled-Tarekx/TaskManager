import { config } from "dotenv";
config();
import  express from "express"
import mongoose from "mongoose";
import { MongoClient, ServerApiVersion } from "mongodb";
import ErrorHandler from "./errors/middleware.js";
import UserRouter from "./user/routes.js";


const app = express();

const uri: string | undefined = process.env.URI;
const validUri: string = uri ?? '';

const connectWithRetry = () => {
    console.log('MongoDB connection with retry');
    mongoose.connect(validUri, {
        serverSelectionTimeoutMS: 30000, // 30 seconds
        connectTimeoutMS: 30000 // 30 seconds
    }).then(() => {
        console.log('MongoDB is connected');
    }).catch(err => {
        console.error('MongoDB connection unsuccessful, retry after 5 seconds.', err);
        setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();

mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to DB Cluster');
});

mongoose.connection.on('error', (error) => {
    console.error('Mongoose connection error:', error);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected');
});


connectWithRetry()
mongoose.set('debug', true);

app.use(express.json());
app.use('/users', UserRouter)
app.use(ErrorHandler);


app.listen(process.env.PORT, () => {
    console.log(`app is listening on port ${process.env.PORT}`);
});

