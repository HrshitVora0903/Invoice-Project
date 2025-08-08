import express from "express";
import {
    getAllFirms,
    createFirm,
    getFirmById,
    updateFirm,
    deleteFirm,
    getActiveFirms
} from "../controllers/firmController.js";

const router = express.Router();

router.get("/firms", getAllFirms);
router.get("/firms/active", getActiveFirms); // ✅ Active route
router.post("/firms", createFirm);
router.get("/firms/:id", getFirmById);
router.put("/firms/:id", updateFirm);
router.delete("/firms/:id", deleteFirm);

export default router;
