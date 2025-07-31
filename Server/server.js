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
// Add this in server.js
app.get("/api/allinvoices", (req, res) => {
  db.query("SELECT * FROM invoices ORDER BY id DESC", (err, results) => {
    if (err) {
      console.error("Error fetching invoices:", err);
      return res.status(500).json({ error: "Failed to fetch invoices" });
    }
    res.json(results);
  });
});



// //POST new invoice(Memory  Version)
// app.post('/invoices', function (req, res) {
//   const newInvoice = req.body;

//   // find used number
//   var usedNumbers = invoices.map(function(inv) {
//     return parseInt(inv.invoiceNo, 10);
//   });

//   //find maximum number
//   var maxInvo = usedNumbers.length > 0 ? Math.max.apply(null, usedNumbers) : -1;


//   if (newInvoice.invoiceNo && newInvoice.invoiceNo !== ""){
//     var enteredNo = parseInt(newInvoice.invoiceNo,10);

//     if(usedNumbers.includes(enteredNo)){
//        return res.status(400).json({ message: "Invoice number already exists." });
//     }
//     newInvoice.invoiceNo= enteredNo.toString();
//     } else {
//       newInvoice.invoiceNo = (maxInvo + 1).toString();
//     }


//   newInvoice.id = Date.now().toString();
//   invoices.push(newInvoice);
//   res.status(201).json({ message: 'Invoice added', invoice: newInvoice });
// });


app.put("/api/invoice/:id", (req, res) => {
    const invoiceId = req.params.id;
    const { invoiceNo, partyName, gstNo, date, items } = req.body;

    console.log("🔄 Updating invoice:", invoiceId);

    // Update invoice
    const updateInvoiceQuery = `
        UPDATE invoices 
        SET invoice_no = ?, party_name = ?, gst_no = ?, date = ? 
        WHERE id = ?
    `;

    db.query(updateInvoiceQuery, [invoiceNo, partyName, gstNo, date, invoiceId], (err, result) => {
        if (err) {
            console.error("❌ Error updating invoice:", err);
            return res.status(500).json({ error: "Failed to update invoice" });
        }

        console.log("✅ Invoice updated");

        // Delete old items
        db.query("DELETE FROM invoice_items WHERE invoice_id = ?", [invoiceId], (err, result) => {
            if (err) {
                console.error("❌ Error deleting invoice items:", err);
                return res.status(500).json({ error: "Failed to delete invoice items" });
            }

            console.log("🗑️ Old items deleted");

            if (!items || items.length === 0) {
                // No new items to insert
                return res.json({ message: "Invoice updated successfully with no items." });
            }

            // Insert new items — wait for all to finish before sending response
            const insertQuery = `
                INSERT INTO invoice_items 
                (invoice_id, item_name, quantity, rate, amount, gst_percent, gst_amount) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
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
                    item.gstAmt
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
                        res.json({ message: "Invoice updated successfully!" });
                    }
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



app.get('/api/invoice/:id', function (req, res) {
    var invoiceId = req.params.id;

    db.query('SELECT * FROM invoices WHERE id = ?', [invoiceId], function (err, results) {
        if (err || results.length === 0) {
            return res.status(404).json({ error: "Invoice not found" });
        }

        var invoice = results[0];

        db.query('SELECT * FROM invoice_items WHERE invoiceId = ?', [invoiceId], function (err, itemResults) {
            if (err) {
                return res.status(500).json({ error: "Failed to get items" });
            }

            res.json({ invoice: invoice, items: itemResults });
        });
    });
});


app.put("/api/invoice/:id", (req, res) => {
    const invoiceId = req.params.id;
    const { invoiceNo, partyName, gstNo, date, items } = req.body;

    // Update main invoice record
    const updateInvoiceSql = `
        UPDATE invoices 
        SET invoiceNo = ?, partyName = ?, gstNo = ?, date = ?
        WHERE id = ?
    `;

    db.query(updateInvoiceSql, [invoiceNo, partyName, gstNo, date, invoiceId], (err) => {
        if (err) {
            console.error("Error updating invoice:", err);
            return res.status(500).json({ error: "Failed to update invoice" });
        }

        // Delete previous items
        db.query("DELETE FROM invoice_items WHERE invoice_id = ?", [invoiceId], (err) => {
            if (err) {
                console.error("Error deleting old items:", err);
                return res.status(500).json({ error: "Failed to delete old items" });
            }

            // Insert new items
            const insertItemSql = `
                INSERT INTO invoice_items 
                (invoiceId, itemName, qty, rate, amt, gstP, gstAmt, netAmt) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;

            // Insert each item one-by-one
            let pending = items.length;
            if (pending === 0) {
                return res.json({ success: true, message: "Invoice updated (no items)." });
            }

            items.forEach(item => {
                db.query(insertItemSql, [
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
                        console.error("Error inserting item:", err);
                        return res.status(500).json({ error: "Failed to insert item" });
                    }

                    pending--;
                    if (pending === 0) {
                        // All items inserted
                        return res.json({ success: true, message: "Invoice updated successfully" });
                    }
                });
            });
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




app.listen(5000, function () {
  console.log("this 5000 port");
});