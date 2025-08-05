const express = require("express");
var cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const { connect } = require("mssql");
// const { use } = require("react");

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // most common default
  password: 'root',
  database: 'invoice_app'
});

db.connect(err => {
  if (!err) {
    console.log("Connected Database")
  } else {
    console.log(err);
  }
})

const app = express()
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
//var invoices =[];

// get all invoices
// app.get("/api/allinvoices", (req, res) => {
//   db.query("SELECT * FROM invoices ORDER BY id DESC", (err, results) => {
//     if (err) {
//       console.error("Error fetching invoices:", err);
//       return res.status(500).json({ error: "Failed to fetch invoices" });
//     }
//     res.json(results);
//   });
// });

app.get("/api/allinvoices", (req, res) => {
  db.query(
    "SELECT id, invoiceNo, partyName, gstNo, DATE_FORMAT(date, '%d-%m-%Y') AS date, amt, gstAmt, netAmt FROM invoices ORDER BY id DESC",
    (err, results) => {
      if (err) {
        console.error("Error fetching invoices:", err);
        return res.status(500).json({ error: "Failed to fetch invoices" });
      }
      res.json(results);
    }
  );
});

//submit data to dataabase
app.post("/api/invoices", function (req, res) {
  const invoiceNo = req.body.invoiceNo;
  const partyName = req.body.partyName;
  const gstNo = req.body.gstNo;
  const date = req.body.date;
  const items = req.body.items;


  // Insert into invoices table
  const insertInvoiceQuery = `
        INSERT INTO invoices (invoiceNo, partyName, gstNo, date, amt, gstAmt, netAmt)
        VALUES (?, ?, ?, ?, 0, 0, 0)
    `;

  db.query(insertInvoiceQuery, [invoiceNo, partyName, gstNo, date], function (err, result) {
    if (err) {
      console.error("❌ Error inserting invoice:", err);
      return res.status(500).json({ error: "Failed to create invoice" });
    }

    const invoiceId = result.insertId;

    if (!items || items.length === 0) {
      return res.json({ message: "Invoice created with no items." });
    }

    const insertItemQuery = `
            INSERT INTO invoice_items 
            (invoiceId, itemName, qty, rate, amt, gstP, gstAmt, netAmt) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

    var remaining = items.length;
    var insertError = false;

    items.forEach(function (item) {
      db.query(insertItemQuery, [
        invoiceId,
        item.itemName,
        item.qty,
        item.rate,
        item.amt,
        item.gstP,
        item.gstAmt,
        item.netAmt
      ], function (err) {
        if (err) {
          console.error("❌ Error inserting item:", item, err);
          insertError = true;
        }

        remaining--;
        if (remaining === 0) {
          if (insertError) {
            return res.status(500).json({ error: "Some items failed to insert" });
          }

          // Update totals in invoice
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

          db.query(updateTotalsQuery, [invoiceId, invoiceId, invoiceId, invoiceId, invoiceId], function (err) {
            if (err) {
              console.error("❌ Error updating totals:", err);
              return res.status(500).json({ error: "Failed to update totals" });
            }

            res.json({ message: "Invoice created successfully!" });
          });
        }
      });
    });
  });
});


app.put("/api/invoice/:id", (req, res) => {
  const invoiceId = req.params.id;
  const { invoiceNo, partyName, gstNo, date, items } = req.body;

  console.log("🔄 Updating invoice:", invoiceId);

  // ✅ First check if invoiceNo already exists for another invoice
  const checkDuplicateQuery = `
    SELECT id FROM invoices WHERE invoiceNo = ? AND id != ?
  `;

  db.query(checkDuplicateQuery, [invoiceNo, invoiceId], (err, duplicateResults) => {
    if (err) {
      console.error("❌ Error checking for duplicate invoice number:", err);
      return res.status(500).json({ error: "Database error during invoice number check" });
    }

    if (duplicateResults.length > 0) {
      return res.status(409).json({ error: "Invoice number already exists" });
    }

    // ✅ Proceed to update invoice if invoice number is unique
    const updateInvoiceQuery = `
      UPDATE invoices 
      SET invoiceNo = ?, partyName = ?, gstNo = ?, date = ? 
      WHERE id = ?
    `;

    db.query(updateInvoiceQuery, [invoiceNo, partyName, gstNo, date, invoiceId], (err, result) => {
      if (err) {
        console.error("❌ Error updating invoice:", err);
        return res.status(500).json({ error: "Failed to update invoice" });
      }

      console.log("✅ Invoice updated");

      // Delete old items
      db.query("DELETE FROM invoice_items WHERE invoiceId = ?", [invoiceId], (err, result) => {
        if (err) {
          console.error("❌ Error deleting invoice items:", err);
          return res.status(500).json({ error: "Failed to delete invoice items" });
        }

        console.log("🗑️ Old items deleted");

        if (!items || items.length === 0) {
          // No new items to insert
          return res.json({ message: "Invoice updated successfully with no items." });
        }

        // Insert new items
        const insertQuery = `
          INSERT INTO invoice_items 
          (invoiceId, itemName, qty, rate, amt, gstP, gstAmt,netAmt) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        let remaining = items.length;
        let insertError = false;

        items.forEach(item => {
          db.query(insertQuery, [
            invoiceId,
            item.itemName,
            item.qty,
            item.rate,
            item.amt,
            item.gstP,
            item.gstAmt,
            item.netAmt
          ], (err, result) => {
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

              // Update invoice totals
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
});


app.get("/api/check-invoice/:invoiceNo", function (req, res) {
  const invoiceNo = req.params.invoiceNo;

  const query = "SELECT COUNT(*) AS count FROM invoices WHERE invoiceNo = ?";
  db.query(query, [invoiceNo], function (err, results) {
    if (err) {
      console.error("Error checking invoice number:", err);
      return res.status(500).json({ error: "Database error" });
    }

    const exists = results[0].count > 0;
    res.json({ exists: exists });
  });
});


//invoice number
app.get("/api/next-invoice-number", function (req, res) {
  const query = "SELECT MAX(CAST(invoiceNo AS UNSIGNED)) AS maxNo FROM invoices";

  db.query(query, function (err, results) {
    if (err) {
      console.error("Error fetching invoice number:", err);
      return res.status(500).json({ error: "Failed to get invoice number" });
    }

    const nextInvoiceNo = (results[0].maxNo || 0) + 1;
    res.json({ nextInvoiceNo: nextInvoiceNo.toString() });
  });
});


app.delete('/api/invoice/:id', function (req, res) {
  var invoiceId = req.params.id;

  db.query('DELETE FROM invoice_items WHERE invoiceId = ?', [invoiceId], function (err, result) {
    if (err) {
      console.error('Error deleting invoice items:', err);
      return res.status(500).json({ error: 'Failed to delete invoice items' });
    }

    db.query('DELETE FROM invoices WHERE id = ?', [invoiceId], function (err, result) {
      if (err) {
        console.error('Error deleting invoice:', err);
        return res.status(500).json({ error: 'Failed to delete invoice' });
      }

      res.status(200).json({ message: 'Invoice deleted successfully' });
    });
  });
});



app.get("/api/invoice/:id", (req, res) => {
  const invoiceId = req.params.id;

  const query = `
    SELECT id, invoiceNo, partyName, gstNo, 
           DATE_FORMAT(date, '%Y-%m-%d') as date
    FROM invoices 
    WHERE id = ?
  `;

  db.query(query, [invoiceId], (err, result) => {
    if (err) {
      console.error("❌ Error fetching invoice:", err);
      return res.status(500).json({ error: "Failed to fetch invoice" });
    }

    const invoice = result[0];

    db.query("SELECT * FROM invoice_items WHERE invoiceId = ?", [invoiceId], (err2, itemResult) => {
      if (err2) {
        console.error("❌ Error fetching invoice items:", err2);
        return res.status(500).json({ error: "Failed to fetch items" });
      }

      res.json({ invoice, items: itemResult });
    });
  });
});




// Helpers
function calculateTotalAmt(items) {
  return items.reduce(function (sum, item) { return sum + item.amt; }, 0);
}

function calculateTotalGst(items) {
  return items.reduce(function (sum, item) { return sum + item.gstAmt; }, 0);
}

function calculateNetAmt(items) {
  return items.reduce(function (sum, item) { return sum + item.netAmt; }, 0);
}




// -----------
// ------------
// -----------
//for  Firms
// ----------
// ----------
// ------------

//Get All Firms
app.get('/api/firms', (req, res) => {
  const query = 'SELECT * FROM firms';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'DB Error' });
    res.json(results);
  });
});

//Add New Firm
app.post('/api/firms', (req, res) => {
  const { partName, gstNo, state, personName, status, mobile, email } = req.body;
  const query = 'INSERT INTO firms (partName, gstNo, state, personName, status, mobile, email) VALUES (?, ?, ?, ?, ?, ?, ?)';

  db.query(query, [partName, gstNo, state, personName, status, mobile, email], (err, result) => {
    if (err) return res.status(500).json({ error: 'Insert Failed' });

    // Fetch the inserted row by ID and return it
    const selectQuery = 'SELECT * FROM firms WHERE id = ?';
    db.query(selectQuery, [result.insertId], (err2, rows) => {
      if (err2) return res.status(500).json({ error: 'Fetch after insert failed' });
      res.status(201).json(rows[0]);
    });
  });
});



//Update firm
app.put('/api/firms/:id', (req, res) => {
  const id = req.params.id;
  const { partName, gstNo, state, personName, status, mobile, email } = req.body;
  const query = 'UPDATE firms SET partName = ?, gstNo = ?, state = ?, personName = ?, status = ?, mobile = ?, email = ? WHERE id = ?';
  db.query(query, [partName, gstNo, state, personName, status, mobile, email, id], (err) => {
    if (err) return res.status(500).json({ error: 'Update failed' });
    db.query('SELECT * FROM firms WHERE id = ?', [id], (err2, rows) => {
      if (err2) return res.status(500).json({ error: 'Fetch updated firm failed' });
      res.json(rows[0]);
    });
  });
});


//Delete firm
app.delete('/api/firms/:id', (req, res) => {
  const query = 'DELETE FROM firms WHERE id = ?';
  db.query(query, [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: 'Delete Failed' });
    res.json({ message: 'Firm deleted' });
  });
});



// =======================
// ITEM ROUTES
// =======================

// Get all items
app.get('/api/items', (req, res) => {
  db.query('SELECT * FROM items', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get single item (optional)
app.get('/api/items/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM items WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Item not found' });
    res.json(results[0]);
  });
});

// Add item
app.post('/api/items', (req, res) => {
  const { itemName, hsnCode, status } = req.body;
  db.query(
    'INSERT INTO items (itemName, hsnCode, status) VALUES (?, ?, ?)',
    [itemName, hsnCode, status],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: result.insertId, itemName, hsnCode, status });
    }
  );
});

// Update item
app.put('/api/items/:id', (req, res) => {
  const { id } = req.params;
  const { itemName, hsnCode, status } = req.body;
  db.query(
    'UPDATE items SET itemName = ?, hsnCode = ?, status = ? WHERE id = ?',
    [itemName, hsnCode, status, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, itemName, hsnCode, status });
    }
  );
});

// Delete item
app.delete('/api/items/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM items WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Item deleted successfully' });
  });
});




app.listen(5000, function () {
  console.log("this 5000 port");
});