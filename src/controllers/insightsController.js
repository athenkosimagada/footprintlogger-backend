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
      return res.status(200).json({ tip: null });
    }

    const categoryTotals = userLogs.reduce((acc, log) => {
      acc[log.category] = (acc[log.category] || 0) + log.carbonFootprint;
      return acc;
    }, {});

    const highestCategory = Object.keys(categoryTotals).reduce((a, b) => {
      return categoryTotals[a] > categoryTotals[b] ? a : b;
    });

    const tip = generateTip(highestCategory, categoryTotals[highestCategory]);

    return res.status(200).json({ tip });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
};

const addWeeklyGoal = async (req, res) => {
  try {
    const db = await connectDB();
    const weeklyGoals = db.collection("weeklyGoals");
    const logs = db.collection("logs");

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { targetReduction, category } = req.body;

    const newGoal = {
      userId,
      targetReduction,
      category,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await weeklyGoals.insertOne(newGoal);

    const latestGoal = {
      ...newGoal,
      _id: result.insertedId,
    };
    const goalStartDate = new Date(latestGoal.createdAt);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const startDate =
      goalStartDate > sevenDaysAgo ? goalStartDate : sevenDaysAgo;

    const userLogs = await logs
      .find({
        userId,
        category: latestGoal.category,
        date: { $gte: startDate },
      })
      .toArray();

    const totalEmission = userLogs.reduce(
      (sum, log) => sum + log.carbonFootprint,
      0
    );

    const io = req.app.get("io");
    if (io)
      io.emit("weeklyGoalUpdate", {
        goalId: result.insertedId,
        ...newGoal,
        progress: 0,
        totalEmission,
      });

    return res.status(201).json({ message: "Weekly goal added successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
};

const getWeeklyGoal = async (req, res) => {
  try {
    const db = await connectDB();
    const logs = db.collection("logs");
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

    if (!latestGoalArray.length) return res.status(200).json({ goal: null });

    const latestGoal = latestGoalArray[0];
    const goalStartDate = new Date(latestGoal.createdAt);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const startDate =
      goalStartDate > sevenDaysAgo ? goalStartDate : sevenDaysAgo;

    const userLogs = await logs
      .find({
        userId,
        category: latestGoal.category,
        date: { $gte: startDate },
      })
      .toArray();

    const totalEmission = userLogs.reduce(
      (sum, log) => sum + log.carbonFootprint,
      0
    );

    let progress =
      ((latestGoal.targetReduction - totalEmission) /
        latestGoal.targetReduction) *
      100;

    progress = Math.min(Math.max(progress, -100), 100);

    const io = req.app.get("io");
    if (io)
      io.emit("weeklyGoalUpdate", {
        goalId: latestGoal._id,
        targetReduction: latestGoal.targetReduction,
        category: latestGoal.category,
        progress,
        totalEmission,
      });

    return res.status(200).json({
      goal: {
        targetReduction: latestGoal.targetReduction,
        category: latestGoal.category,
        progress,
        totalEmission,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
};

export { getLatestTip, addWeeklyGoal, getWeeklyGoal };
