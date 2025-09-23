import { connectDB } from "../models/db.js";
import { ObjectId } from "mongodb";
import { generateTip } from "../utils/index.js";

const getLatestTip = async (req, res) => {
  try {
    const db = await connectDB();
    const logs = db.collection("logs");

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userLogs = await logs.find({ userId }).toArray();
    if (userLogs.length === 0) {
      res.status(200).json({ tip: null });
    }

    const categoryTotals = userLogs.reduce((acc, log) => {
      acc[log.category] = (acc[log.category] || 0) + log.carbonFootprint;
      return acc;
    }, {});

    const highestCategory = Object.keys(categoryTotals).reduce((a, b) => {
      return categoryTotals[a] > categoryTotals[b] ? a : b;
    });

    const tip = generateTip(highestCategory, categoryTotals[highestCategory]);

    res.status(200).json({ tip, category: highestCategory });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
};

const addWeeklyGoal = async (req, res) => {
  try {
    const db = await connectDB();
    const weeklyGoals = db.collection("weeklyGoals");

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { targetReduction, category } = req.body;

    await weeklyGoals.insertOne({
      userId,
      targetReduction,
      category,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(201).json({ message: "Weekly goal added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
};

const getWeeklyGoal = async (req, res) => {
  try {
    const db = await connectDB();
    const weeklyGoals = db.collection("weeklyGoals");

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const latestGoalArray = await weeklyGoals
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(1)
      .toArray();

    if (latestGoalArray.length === 0)
      return res.status(200).json({ goal: null });

    const latestGoal = latestGoalArray[0];

    const userLogs = await logs
      .find({ userId, category: latestGoal.category })
      .toArray();
    const totalEmission = userLogs.reduce(
      (sum, log) => sum + log.carbonFootprint,
      0
    );
    const progress = Math.min(
      (totalEmission / latestGoal.targetReduction) * 100,
      100
    );

    res.status(200).json({
      goal: latestGoal,
      progress,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
};

export { getLatestTip, addWeeklyGoal, getWeeklyGoal };
