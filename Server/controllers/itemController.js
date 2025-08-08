import db from "../config/db.js";

// Get all items
export const getAllItems = (req, res) => {
    db.query("SELECT * FROM items ORDER BY id DESC", (err, results) => {
        if (err) return res.status(500).json({ error: "Failed to fetch items" });
        res.json(results);
    });
};

// Get only active items
export const getActiveItems = (req, res) => {
    db.query("SELECT * FROM items WHERE status = 'Active' ORDER BY id DESC", (err, results) => {
        if (err) return res.status(500).json({ error: "Failed to fetch active items" });
        res.json(results);
    });
};


// Create new item
export const createItem = (req, res) => {
    const { itemName, hsnCode, status } = req.body;
    db.query(
        "INSERT INTO items (itemName, hsnCode, status) VALUES (?, ?, ?)",
        [itemName, hsnCode, status],
        (err, result) => {
            if (err) return res.status(500).json({ error: "Failed to create item" });
            res.status(201).json({ message: "Item created successfully", id: result.insertId });
        }
    );
};

// Get item by ID
export const getItemById = (req, res) => {
    const { id } = req.params;
    db.query("SELECT * FROM items WHERE id = ?", [id], (err, results) => {
        if (err) return res.status(500).json({ error: "Failed to fetch item" });
        if (results.length === 0) return res.status(404).json({ error: "Item not found" });
        res.json(results[0]);
    });
};

// Update item
export const updateItem = (req, res) => {
    const { id } = req.params;
    const { itemName, hsnCode, status } = req.body;
    db.query(
        "UPDATE items SET itemName = ?, hsnCode = ?, status = ? WHERE id = ?",
        [itemName, hsnCode, status, id],
        (err) => {
            if (err) return res.status(500).json({ error: "Failed to update item" });
            res.json({ message: "Item updated successfully" });
        }
    );
};

// Delete item
export const deleteItem = (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM items WHERE id = ?", [id], (err) => {
        if (err) return res.status(500).json({ error: "Failed to delete item" });
        res.json({ message: "Item deleted successfully" });
    });
};
