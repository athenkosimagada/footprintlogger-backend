import { connectDB } from "../models/db.js";
import { ObjectId } from "mongodb";

const getStreak = async (req, res) => {
  try {
    const db = await connectDB();
    const logs = db.collection("logs");

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const uniqueLogDates = await logs
      .aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          },
        },
        { $sort: { _id: -1 } },
      ])
      .toArray();

    if (uniqueLogDates.length === 0) {
      return res.status(200).json({ currentStreak: 0, highestStreak: 0 });
    }

    let currentStreak = 1;
    let highestStreak = 1;

    for (let i = 1; i < uniqueLogDates.length; i++) {
      const prevDate = new Date(uniqueLogDates[i - 1]._id);
      const currDate = new Date(uniqueLogDates[i]._id);

      const diff = (prevDate - currDate) / (1000 * 60 * 60 * 24);

      if (diff === 1) currentStreak++;
      else currentStreak = 1;

      highestStreak = Math.max(highestStreak, currentStreak);
    }

    res.status(200).json({ currentStreak, highestStreak });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
};

const getWeeklySummary = async (req, res) => {
  try {
    const db = await connectDB();
    const logs = db.collection("logs");

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const summary = await logs
      .aggregate([
        { $match: { userId, createdAt: { $gte: oneWeekAgo } } },
        {
          $group: {
            _id: "$category",
            totalCarbonFootprint: {
              $sum: { $ifNull: ["$carbonFootprint", 0] },
            },
            totalQuantity: { $sum: { $ifNull: ["$quantity", 0] } },
          },
        },
      ])
      .toArray();

    res.status(200).json(summary);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
};

const getCommunityAverage = async (req, res) => {
  try {
    const db = await connectDB();
    const logs = db.collection("logs");

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const communityAverage = await logs
      .aggregate([
        {
          $group: {
            _id: null,
            averageCarbonFootprint: {
              $avg: { $ifNull: ["$carbonFootprint", 0] },
            },
            averageQuantity: { $avg: { $ifNull: ["$quantity", 0] } },
          },
        },
        {
          $project: {
            _id: 0,
            averageCarbonFootprint: 1,
            averageQuantity: 1,
          },
        },
      ])
      .toArray();

    res.status(200).json(communityAverage[0] || {});
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
};

const getTopContributors = async (req, res) => {
  try {
    const db = await connectDB();
    const logs = db.collection("logs");
    const users = db.collection("users");

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const topContributors = await logs
      .aggregate([
        {
          $group: {
            _id: "$userId",
            totalCarbonFootprint: {
              $sum: { $ifNull: ["$carbonFootprint", 0] },
            },
          },
        },
        {
          $addFields: { userObjectId: { $toObjectId: "$_id" } },
        },
        {
          $lookup: {
            from: "users",
            localField: "userObjectId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $project: {
            _id: 0,
            userId: "$_id",
            firstName: "$user.firstName",
            lastName: "$user.lastName",
            totalCarbonFootprint: 1,
          },
        },
        { $sort: { totalCarbonFootprint: 1 } },
        { $limit: 10 },
      ])
      .toArray();

    res.status(200).json(topContributors);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
};

export { getStreak, getWeeklySummary, getCommunityAverage, getTopContributors };
