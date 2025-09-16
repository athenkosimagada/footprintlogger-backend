import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "../models/db.js";
import { jwtSecret } from "../config/index.js";

const register = async (req, res) => {
  try {
    const db = await connectDB();
    const users = db.collection("users");
    const { firstName, lastName, email, password } = req.body;

    const existingUser = await users.findOne({ email });
    if (existingUser)
      return res.status(400).send({ message: "Email already in use" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await users.insertOne({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const payload = {
      user: {
        id: user.insertedId,
        email,
        firstName,
        lastName,
      },
    };

    const token = jwt.sign(payload, jwtSecret);
    console.log("User registered successfully");
    res.status(201).json({ token, user: payload.user });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
};

const login = async (req, res) => {
  try {
    const db = await connectDB();
    const users = db.collection("users");
    const { email, password } = req.body;

    const user = await users.findOne({ email });
    if (!user) return res.status(400).send({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).send({ message: "Invalid credentials" });

    const payload = {
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };

    const token = jwt.sign(payload, jwtSecret);
    console.log("User logged in successfully");
    res.status(200).json({ token, user: payload.user });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
};

export { register, login };
