import express from "express";
import {
    getAllItems,
    createItem,
    getItemById,
    updateItem,
    deleteItem,
    getActiveItems
} from "../controllers/itemController.js";

const router = express.Router();

router.get("/items", getAllItems);
router.get("/items/active", getActiveItems); // ✅ Active route
router.post("/items", createItem);
router.get("/items/:id", getItemById);
router.put("/items/:id", updateItem);
router.delete("/items/:id", deleteItem);

export default router;
