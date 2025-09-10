import express from "express";
import {
  getStreak,
  getWeeklySummary,
  getCommunityAverage,
  getTopContributors,
} from "../controllers/statsController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.get("/streak", authenticate, asyncHandler(getStreak));
router.get("/weekly-summary", authenticate, asyncHandler(getWeeklySummary));
router.get(
  "/community-average",
  authenticate,
  asyncHandler(getCommunityAverage)
);
router.get("/top-contributors", authenticate, asyncHandler(getTopContributors));

export default router;
