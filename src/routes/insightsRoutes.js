import express from "express";
import {
  getLatestTip,
  addWeeklyGoal,
  getWeeklyGoal,
} from "../controllers/insightsController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { body, validationResult } from "express-validator";

const router = express.Router();

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.get("/latest-tip", authenticate, asyncHandler(getLatestTip));
router.post(
  "/add-weekly-goal",
  authenticate,
  [
    body("targetReduction")
      .isNumeric()
      .withMessage("Target reduction must be a number"),
    body("category")
      .notEmpty()
      .withMessage("Category is required (e.g., food, travel, energy)"),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    await addWeeklyGoal(req, res);
  })
);
router.get("/weekly-goal", authenticate, asyncHandler(getWeeklyGoal));

export default router;
