import mongoose from "mongoose";


let isConnected = false; // Track connection state

const connect = async () => {
  if (isConnected) {
    console.log("MongoDB is already connected");
    return mongoose.connection;
  }

  try {
    
    const mongoUrl = process.env.MONGODB_URL;
    if (!mongoUrl) {
      throw new Error("MONGODB_URL environment variable is not defined");
    }
    const db = mongoose.connect(mongoUrl, {
      maxPoolSize: 10, 
      autoIndex: false,
      autoCreate: false,
      family: 4,
    });

    isConnected = true;
    console.log("MongoDB connected successfully");

    return db;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
};

const disconnect = async () => {
  if (!isConnected) return;

  try {
    await mongoose.connection.close();
    isConnected = false;
    console.log("MongoDB disconnected successfully");
  } catch (error) {
    console.error("Error disconnecting from MongoDB:", error);
  }
};

export default { connect, disconnect };
