import db from "../config/db.js";

// Get all firms
export const getAllFirms = (req, res) => {
    db.query("SELECT * FROM firms ORDER BY id DESC", (err, results) => {
        if (err) return res.status(500).json({ error: "Failed to fetch firms" });
        res.json(results);
    });
};

// Get only active firms
export const getActiveFirms = (req, res) => {
    db.query("SELECT * FROM firms WHERE status = 'Active' ORDER BY id DESC", (err, results) => {
        if (err) return res.status(500).json({ error: "Failed to fetch active firms" });
        res.json(results);
    });
};


// // Create a new firm
// export const createFirm = (req, res) => {
//     const { partyName, gstNo, state, personName, mobile, email, status } = req.body;
//     db.query(
//         "INSERT INTO firms (partyName, gstNo, state, personName, mobile, email, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
//         [partyName, gstNo, state, personName, mobile, email, status],
//         (err, result) => {
//             if (err) return res.status(500).json({ error: "Failed to create firm" });
//             res.status(201).json({ message: "Firm created successfully", id: result.insertId });
//         }
//     );
// };

// controllers/firmController.js
export const createFirm = (req, res) => {
    const { partyName, gstNo, state, personName, mobile, email, status } = req.body;

    const insertQuery = `
        INSERT INTO firms (partyName, gstNo, state, personName, mobile, email, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        insertQuery,
        [partyName, gstNo, state, personName, mobile, email, status],
        (err, result) => {
            if (err) {
                console.error("Error inserting firm:", err);
                return res.status(500).json({ error: "Failed to create firm" });
            }

            const insertedId = result.insertId;

            const fetchQuery = 'SELECT * FROM firms WHERE id = ?';
            db.query(fetchQuery, [insertedId], (err2, rows) => {
                if (err2) {
                    console.error("Error fetching inserted firm:", err2);
                    return res.status(500).json({ error: "Failed to fetch newly created firm" });
                }

                return res.status(201).json(rows[0]); // ✅ Return full firm object
            });
        }
    );
};



// Get firm by ID
export const getFirmById = (req, res) => {
    const { id } = req.params;
    db.query("SELECT * FROM firms WHERE id = ?", [id], (err, results) => {
        if (err) return res.status(500).json({ error: "Failed to fetch firm" });
        if (results.length === 0) return res.status(404).json({ error: "Firm not found" });
        res.json(results[0]);


    });
};

// Update a firm
export const updateFirm = (req, res) => {
    const { id } = req.params;
    const { partyName, gstNo, state, personName, mobile, email, status } = req.body;

    const updateQuery = `
        UPDATE firms 
        SET partyName = ?, gstNo = ?, state = ?, personName = ?, mobile = ?, email = ?, status = ? 
        WHERE id = ?
    `;

    db.query(
        updateQuery,
        [partyName, gstNo, state, personName, mobile, email, status, id],
        (err) => {
            if (err) {
                console.error("Error updating firm:", err);
                return res.status(500).json({ error: "Failed to update firm" });
            }

            // ✅ Fetch the updated row
            const fetchQuery = 'SELECT * FROM firms WHERE id = ?';
            db.query(fetchQuery, [id], (err2, rows) => {
                if (err2) {
                    console.error("Error fetching updated firm:", err2);
                    return res.status(500).json({ error: "Failed to fetch updated firm" });
                }

                res.json(rows[0]); // ✅ Return the updated firm
            });
        }
    );
};


// Delete a firm
export const deleteFirm = (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM firms WHERE id = ?", [id], (err) => {
        if (err) return res.status(500).json({ error: "Failed to delete firm" });
        res.json({ message: "Firm deleted successfully" });
    });
};
