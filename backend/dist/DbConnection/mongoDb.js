"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
let isConnected = false; // Track connection state
const connect = () => __awaiter(void 0, void 0, void 0, function* () {
    if (isConnected) {
        console.log("MongoDB is already connected");
        return mongoose_1.default.connection;
    }
    try {
        const mongoUrl = process.env.MONGODB_URL;
        if (!mongoUrl) {
            throw new Error("MONGODB_URL environment variable is not defined");
        }
        const db = mongoose_1.default.connect(mongoUrl, {
            maxPoolSize: 10,
            autoIndex: false,
            autoCreate: false,
            family: 4,
        });
        isConnected = true;
        console.log("MongoDB connected successfully");
        return db;
    }
    catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
});
const disconnect = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!isConnected)
        return;
    try {
        yield mongoose_1.default.connection.close();
        isConnected = false;
        console.log("MongoDB disconnected successfully");
    }
    catch (error) {
        console.error("Error disconnecting from MongoDB:", error);
    }
});
exports.default = { connect, disconnect };
