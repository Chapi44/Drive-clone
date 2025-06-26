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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const api_1 = __importDefault(require("./api"));
const mongoDb_1 = __importDefault(require("./DbConnection/mongoDb"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
mongoDb_1.default.connect();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Accept, Content-Type, access-control-allow-origin, x-api-applicationid, authorization");
    res.header("Access-Control-Allow-Methods", "OPITIONS, GET, PUT, PATCH, POST, DELETE");
    next();
});
app.use(express_1.default.json());
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "uploads")));
(0, api_1.default)(app);
app.use((req, res, next) => {
    res.status(404).json({
        message: "Ohh you are lost, read the API documentation to find your way back home :)",
    });
});
const initApp = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const PORT = process.env.PORT; // Use PORT_OTP from .env or fallback to 4500
        app.listen(Number(PORT), function connectionListener() {
            console.log(`Hi there! I'm listening on port ${PORT} `);
        });
    }
    catch (err) {
        console.error("Failed to load configuration and start the server:", err);
        process.exit(1); // Exit the process with an error code
    }
});
initApp();
exports.default = app;
