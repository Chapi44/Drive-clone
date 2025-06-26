import UserModel from "../models/user.model";
import { IUser } from "../models/types/user";

/**
 * Create a new user
 */
export const createUser = async (userData: Partial<IUser>) => {
  const user = new UserModel(userData);
  return await user.save();
};

/**
 * Find a user by email
 */
export const findUserByEmail = async (email: string) => {
  return await UserModel.findOne({ email }).select("+password");
};

/**
 * Find user by ID
 */
export const findUserById = async (id: string) => {
  return await UserModel.findById(id);
};

/**
 * Update user by ID
 */
export const updateUserById = async (id: string, updateData: Partial<IUser>) => {
  return await UserModel.findByIdAndUpdate(id, updateData, { new: true });
};

/**
 * Delete user by ID
 */
export const deleteUserById = async (id: string) => {
  return await UserModel.findByIdAndDelete(id);
};

/**
 * List all users (use with caution in production)
 */
export const getAllUsers = async () => {
  return await UserModel.find();
};
