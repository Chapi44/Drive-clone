import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { createUser, findUserByEmail, findUserById } from "../dal/users.dal";
import { IUser } from "../models/types/user";
import { signToken } from "../utils/jwt";
import { AuthRequest } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";

const SALT_ROUNDS = 10;


export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      dateOfBirth,
      gender,
    } = req.body;

    if (!firstName || !lastName || !email || !password || !dateOfBirth || !gender) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const emailAlreadyExists = await findUserByEmail(email);
    if (emailAlreadyExists) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const userData: Partial<IUser> = {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      dateOfBirth: new Date(dateOfBirth),
      gender,
    };

    const user = await createUser(userData) as IUser & { _id: string | { toString(): string } };

    const token = signToken({
      userId: typeof user._id === "string" ? user._id : user._id.toString(),
      email: user.email,
    });

    res.status(201).json({ user, token });

  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Internal server error during registration" });
  }
});


export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = signToken({ userId: (user._id as string | { toString(): string }).toString() });

    res.status(200).json({
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      token,
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error during login" });
  }
});


export const getCurrentUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });

  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
