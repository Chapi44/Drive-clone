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
exports.getCurrentUser = exports.loginUser = exports.registerUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const users_dal_1 = require("../dal/users.dal");
const jwt_1 = require("../utils/jwt");
const asyncHandler_1 = require("../utils/asyncHandler");
const SALT_ROUNDS = 10;
exports.registerUser = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { firstName, lastName, email, password, dateOfBirth, gender, } = req.body;
        if (!firstName || !lastName || !email || !password || !dateOfBirth || !gender) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const emailAlreadyExists = yield (0, users_dal_1.findUserByEmail)(email);
        if (emailAlreadyExists) {
            return res.status(400).json({ error: "Email already exists" });
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, SALT_ROUNDS);
        const userData = {
            firstName,
            lastName,
            email,
            password: hashedPassword,
            dateOfBirth: new Date(dateOfBirth),
            gender,
        };
        const user = yield (0, users_dal_1.createUser)(userData);
        const token = (0, jwt_1.signToken)({
            userId: typeof user._id === "string" ? user._id : user._id.toString(),
            email: user.email,
        });
        res.status(201).json({ user, token });
    }
    catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ error: "Internal server error during registration" });
    }
}));
exports.loginUser = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield (0, users_dal_1.findUserByEmail)(email);
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const isPasswordMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const token = (0, jwt_1.signToken)({ userId: user._id.toString() });
        res.status(200).json({
            user: {
                _id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            },
            token,
        });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error during login" });
    }
}));
exports.getCurrentUser = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const user = yield (0, users_dal_1.findUserById)(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({
            _id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
        });
    }
    catch (error) {
        console.error("Get current user error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
