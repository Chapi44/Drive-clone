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
exports.getAllUsers = exports.deleteUserById = exports.updateUserById = exports.findUserById = exports.findUserByEmail = exports.createUser = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
/**
 * Create a new user
 */
const createUser = (userData) => __awaiter(void 0, void 0, void 0, function* () {
    const user = new user_model_1.default(userData);
    return yield user.save();
});
exports.createUser = createUser;
/**
 * Find a user by email
 */
const findUserByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    return yield user_model_1.default.findOne({ email }).select("+password");
});
exports.findUserByEmail = findUserByEmail;
/**
 * Find user by ID
 */
const findUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield user_model_1.default.findById(id);
});
exports.findUserById = findUserById;
/**
 * Update user by ID
 */
const updateUserById = (id, updateData) => __awaiter(void 0, void 0, void 0, function* () {
    return yield user_model_1.default.findByIdAndUpdate(id, updateData, { new: true });
});
exports.updateUserById = updateUserById;
/**
 * Delete user by ID
 */
const deleteUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield user_model_1.default.findByIdAndDelete(id);
});
exports.deleteUserById = deleteUserById;
/**
 * List all users (use with caution in production)
 */
const getAllUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield user_model_1.default.find();
});
exports.getAllUsers = getAllUsers;
