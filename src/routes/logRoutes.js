import express from "express";
import {
  addLog,
  getLogs,
  getLogById,
  updateLog,
  deleteLog,
} from "../controllers/logController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { body, validationResult } from "express-validator";

const router = express.Router();

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.post(
  "/",
  authenticate,
  [
    body("quantity").isNumeric().withMessage("Quantity must be a number"),
    body("quantityUnit").notEmpty().withMessage("Quantity unit is required"),
    body("category").notEmpty().withMessage("Category is required"),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    await addLog(req, res);
  })
);
router.get("/", authenticate, asyncHandler(getLogs));
router.get("/:id", authenticate, asyncHandler(getLogById));
router.put(
  "/:id",
  authenticate,
  [
    body("quantity").isNumeric().withMessage("Quantity must be a number"),
    body("quantityUnit").notEmpty().withMessage("Quantity unit is required"),
    body("category").notEmpty().withMessage("Category is required"),
  ],
  asyncHandler((req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    return updateLog(req, res);
  })
);
router.delete("/:id", authenticate, asyncHandler(deleteLog));

export default router;
