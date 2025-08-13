import express from "express";
import {
    getSummary,
    getDetail
} from "../controllers/reportController.js";

const router = express.Router();

router.get("/summary", getSummary);
router.get("/detail", getDetail);

export default router;