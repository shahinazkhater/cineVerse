import "dotenv/config";
import mongoose from "mongoose";
import dns from "node:dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

export async function connectDB() {
    await mongoose.connect(process.env.MONGO_URL, {
        dbName: "movies"
    });

    console.log("MongoDB connected");
}