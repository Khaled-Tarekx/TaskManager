import dotenv from "dotenv";
dotenv.config();
import express from "express"
import { MongoClient, ServerApiVersion } from "mongodb";
import ErrorHandler from "./errors/middleware.js";

import UserRouter from "./user/routes.js";




const app = express();
app.use(express.json(), UserRouter);

const uri = process.env.URI;
console.log(uri)
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
})

async function connect() {
    try {
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        console.log(
            "Pinged your deployment. You successfully connected to MongoDB!"
        );
    } finally {
        await client.close();
    }
}
connect().catch(console.dir);
app.use(ErrorHandler);
app.listen(process.env.PORT, () => {
    console.log(`app is listening on port ${process.env.PORT}`);
});
