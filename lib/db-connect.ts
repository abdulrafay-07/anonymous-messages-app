import mongoose from "mongoose";

type ConnectionObject = {
    isConnected?: number;
};

const connection: ConnectionObject = {};

// database connection
async function databaseConnect(): Promise<void> {
    if (connection.isConnected) {
        console.log("Already connected to database");
        return;
    }

    try {
        const dbConnection = await mongoose.connect(process.env.MONGODB_URI!);

        // readyState tells that the db connection is fully ready or not, also gives other values
        connection.isConnected = dbConnection.connections[0].readyState;

        console.log("Database connected successfully");

    } catch (error) {
        console.log("Database connection failed, ERROR: ", error);
        // gracefully exit
        process.exit(1);
    };
};

export default databaseConnect;