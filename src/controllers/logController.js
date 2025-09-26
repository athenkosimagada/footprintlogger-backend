import { connectDB } from "../models/db.js";

const addLog = async (req, res) => {
  try {
    const db = await connectDB();
    const logs = db.collection("logs");

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { activity, quantity, quantityUnit, category } = req.body;

    const carbonFootprint = quantity * 0.2;

    const log = await logs.insertOne({
      userId,
      activity,
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

const getLogs = async (req, res) => {
  try {
    const db = await connectDB();
    const logs = db.collection("logs");

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const query = { userId };

    const { category } = req.query;
    if (category && category !== "all") {
      query.category = category;
    }

    const userLogs = await logs.find(query).toArray();
    res.status(200).json(userLogs);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
};

const getLogById = async (req, res) => {
  try {
    const db = await connectDB();
    const logs = db.collection("logs");

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const logId = req.params.id;
    if (typeof logId !== "string") {
      return res.status(400).json({ message: "Invalid log ID" });
    }

    const log = await logs.findOne({ _id: new ObjectId(logId), userId });

    if (!log) {
      return res.status(404).json({ message: "Log not found" });
    }

    res.status(200).json(log);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
};

const updateLog = async (req, res) => {
  try {
    const db = await connectDB();
    const logs = db.collection("logs");

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const logId = req.params.id;
    if (typeof logId !== "string") {
      return res.status(400).json({ message: "Invalid log ID" });
    }

    const log = await logs.findOne({ _id: new ObjectId(logId), userId });
    if (!log) {
      return res.status(404).json({ message: "Log not found" });
    }

    const { activity, quantity, quantityUnit, category } = req.body;

    const carbonFootprint = quantity * 0.2;

    await logs.updateOne(
      { _id: new ObjectId(logId), userId },
      {
        $set: {
          activity,
          quantity,
          quantityUnit,
          category,
          carbonFootprint,
          updatedAt: new Date(),
        },
      }
    );

    res.status(200).json({ message: "Log updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
};

const deleteLog = async (req, res) => {
  try {
    const db = await connectDB();
    const logs = db.collection("logs");

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const logId = req.params.id;
    if (typeof logId !== "string") {
      return res.status(400).json({ message: "Invalid log ID" });
    }

    const log = await logs.findOne({ _id: new ObjectId(logId), userId });
    if (!log) {
      return res.status(404).json({ message: "Log not found" });
    }

    await logs.deleteOne({ _id: new ObjectId(logId), userId });

    res.status(200).json({ message: "Log deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
};

export { addLog, getLogs, getLogById, updateLog, deleteLog };
