import db from "../config/db.js";
import invoiceHelpers from '../helpers/invoiceHelpers.js';




// GET all invoices (summary)
export const getAllInvoices = (req, res) => {
    const query = "SELECT id, invoiceNo, partyName, gstNo, DATE_FORMAT(date, '%d-%m-%Y') AS date, amt, gstAmt, netAmt FROM invoices ORDER BY id DESC";
    db.query(query, (err, data) => {
        if (err) return res.status(500).json({ error: "Failed to fetch invoices" });
        res.status(200).json(data);
    });
};

// GET single invoice with items
export const getInvoiceById = (req, res) => {
    const invoiceId = req.params.id;

    const invoiceQuery = `SELECT id, invoiceNo, partyName, gstNo, 
    DATE_FORMAT(date, '%Y-%m-%d') as date
    FROM invoices 
    WHERE id = ? `;
    const itemsQuery = "SELECT * FROM invoice_items WHERE invoiceId = ?";

    db.query(invoiceQuery, [invoiceId], (err, invoiceResult) => {
        if (err) return res.status(500).json({ error: "Failed to fetch invoice" });
        if (invoiceResult.length === 0) return res.status(404).json({ error: "Invoice not found" });

        db.query(itemsQuery, [invoiceId], (err, itemResults) => {
            if (err) return res.status(500).json({ error: "Failed to fetch invoice items" });

            res.status(200).json({
                invoice: invoiceResult[0],
                items: itemResults
            });
        });
    });
};

// CREATE invoice with items
export const createInvoice = (req, res) => {
    const {
        invoiceNo,
        partyName,
        gstNo,
        date,
        items
    } = req.body;

    const totalAmt = invoiceHelpers.calculateTotalAmt(items);
    const totalGstAmt = invoiceHelpers.calculateTotalGst(items);
    const totalNetAmt = invoiceHelpers.calculateNetAmt(items);

    const invoiceQuery = `
    INSERT INTO invoices (invoiceNo, partyName, gstNo, date, amt, gstAmt, netAmt)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

    db.query(
        invoiceQuery,
        [invoiceNo, partyName, gstNo, date, totalAmt, totalGstAmt, totalNetAmt],
        (err, result) => {
            if (err) return res.status(500).json({ error: "Failed to create invoice" });

            const invoiceId = result.insertId;

            const itemQueries = items.map(item => [
                invoiceId,
                item.itemName,
                item.qty,
                item.rate,
                item.amt,
                item.gstP,
                item.gstAmt,
                invoiceHelpers.parseNumber(item.amt) + invoiceHelpers.parseNumber(item.gstAmt)
            ]);

            const itemsQuery = `
        INSERT INTO invoice_items
        (invoiceId, itemName, qty, rate, amt, gstP, gstAmt, netAmt)
        VALUES ?
      `;

            db.query(itemsQuery, [itemQueries], err => {
                if (err) return res.status(500).json({ error: "Failed to insert invoice items" });
                res.status(201).json({ message: "Invoice created successfully" });
            });
        }
    );
};

// UPDATE invoice with items
export const updateInvoice = (req, res) => {
    const invoiceId = req.params.id;
    const { invoiceNo, partyName, gstNo, date, items } = req.body;

    console.log("🔄 Updating invoice:", invoiceId);

    // ✅ Check for duplicate invoice number
    const checkDuplicateQuery = `SELECT id FROM invoices WHERE invoiceNo = ? AND id != ?`;

    db.query(checkDuplicateQuery, [invoiceNo, invoiceId], (err, duplicateResults) => {
        if (err) {
            console.error("❌ Error checking for duplicate invoice number:", err);
            return res.status(500).json({ error: "Database error during invoice number check" });
        }

        if (duplicateResults.length > 0) {
            return res.status(409).json({ error: "Invoice number already exists" });
        }

        // ✅ Proceed to update invoice basic info
        const updateInvoiceQuery = `
      UPDATE invoices 
      SET invoiceNo = ?, partyName = ?, gstNo = ?, date = ? 
      WHERE id = ?
    `;

        db.query(updateInvoiceQuery, [invoiceNo, partyName, gstNo, date, invoiceId], (err) => {
            if (err) {
                console.error("❌ Error updating invoice:", err);
                return res.status(500).json({ error: "Failed to update invoice" });
            }

            console.log("✅ Invoice updated");

            // ✅ Delete old items
            db.query("DELETE FROM invoice_items WHERE invoiceId = ?", [invoiceId], (err) => {
                if (err) {
                    console.error("❌ Error deleting invoice items:", err);
                    return res.status(500).json({ error: "Failed to delete invoice items" });
                }

                console.log("🗑️ Old items deleted");

                // ✅ Handle no items case
                if (!items || items.length === 0) {
                    return res.json({ message: "Invoice updated successfully with no items." });
                }

                // ✅ Insert new items
                const insertQuery = `
          INSERT INTO invoice_items 
          (invoiceId, itemName, qty, rate, amt, gstP, gstAmt, netAmt) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
                console.log("🧾 Items received for insert:", items);


                let remaining = items.length;
                let insertError = false;

                items.forEach(item => {
                    const netAmt = item.amt + item.gstAmt;

                    db.query(insertQuery, [
                        invoiceId,
                        item.itemName,
                        item.qty,
                        item.rate,
                        item.amt,
                        item.gstP,
                        item.gstAmt,
                        item.netAmt
                    ], (err) => {
                        if (err) {
                            console.error("❌ Error inserting item:", item, err);
                            insertError = true;
                        }

                        remaining--;
                        if (remaining === 0) {
                            if (insertError) {
                                return res.status(500).json({ error: "Some items failed to insert" });
                            }

                            console.log("✅ All items inserted");

                            // ✅ Recalculate totals directly from DB
                            const updateTotalsQuery = `
                UPDATE invoices
                SET 
                  amt = (SELECT IFNULL(SUM(amt), 0) FROM invoice_items WHERE invoiceId = ?),
                  gstAmt = (SELECT IFNULL(SUM(gstAmt), 0) FROM invoice_items WHERE invoiceId = ?),
                  netAmt = (
                    (SELECT IFNULL(SUM(amt), 0) FROM invoice_items WHERE invoiceId = ?) +
                    (SELECT IFNULL(SUM(gstAmt), 0) FROM invoice_items WHERE invoiceId = ?)
                  )
                WHERE id = ?
              `;

                            db.query(updateTotalsQuery, [invoiceId, invoiceId, invoiceId, invoiceId, invoiceId], (err) => {
                                if (err) {
                                    console.error("❌ Error updating invoice totals:", err);
                                    return res.status(500).json({ error: "Failed to update invoice totals" });
                                }

                                console.log("✅ Invoice totals updated");
                                res.json({ message: "Invoice updated successfully!" });
                            });
                        }
                    });
                });
            });
        });
    });
};


// DELETE invoice + its items
export const deleteInvoice = (req, res) => {
    const invoiceId = req.params.id;
    console.log("🔁 DELETE /invoice/:id hit with ID:", invoiceId); // ✅ check if route is hit

    const deleteItemsQuery = "DELETE FROM invoice_items WHERE invoiceId = ?";
    const deleteInvoiceQuery = "DELETE FROM invoices WHERE id = ?";

    db.query(deleteItemsQuery, [invoiceId], (err, result) => {
        if (err) {
            console.error("❌ Error deleting invoice items:", err);
            return res.status(500).json({ error: "Failed to delete invoice items" });
        }

        console.log("✅ Deleted invoice items:", result.affectedRows);

        db.query(deleteInvoiceQuery, [invoiceId], (err, result2) => {
            if (err) {
                console.error("❌ Error deleting invoice:", err);
                return res.status(500).json({ error: "Failed to delete invoice" });
            }

            console.log("✅ Deleted invoice:", result2.affectedRows);
            res.status(200).json({ message: "Invoice deleted successfully" });
        });
    });
};

// Check for duplicate invoice number
// GET /api/check-invoice/:invoiceNo
export const checkInvoiceNo = (req, res) => {
    const { invoiceNo } = req.params;

    const query = "SELECT COUNT(*) AS count FROM invoices WHERE invoiceNo = ?";
    db.query(query, [invoiceNo], (err, result) => {
        if (err) {
            console.error("Error checking invoice number:", err);
            return res.status(500).json({ error: "Database error" });
        }

        const exists = result[0].count > 0;
        res.status(200).json({ exists });
    });
};


// Get next invoice number (numeric only)
export const getNextInvoiceNo = (req, res) => {
    const query = "SELECT MAX(CAST(invoiceNo AS UNSIGNED)) AS maxNo FROM invoices";

    db.query(query, (err, result) => {
        if (err) return res.status(500).json({ error: "Failed to get next invoice number" });

        const maxNo = result[0].maxNo || 0;
        const nextNo = (maxNo + 1).toString();

        res.status(200).json({ nextInvoiceNo: nextNo });
    });
};
