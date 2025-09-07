import { connectDB } from "../models/db.js";

export const logActivity = async (req, res) => {
  try {
    const db = await connectDB();
    const logs = db.collection("logs");
    const { userId, quantity, quantityUnit, category, carbonFootprint } =
      req.body;

    const log = await logs.insertOne({
      userId,
      quantity,
      quantityUnit,
      category,
      carbonFootprint,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(201).json({ message: "Activity logged successfully", log });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
};

export const getActivityLogs = async (req, res) => {
  try {
    const db = await connectDB();
    const logs = db.collection("logs");
    const { userId } = req.params;

    const userLogs = await logs.find({ userId }).toArray();
    res.status(200).json(userLogs);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
};
