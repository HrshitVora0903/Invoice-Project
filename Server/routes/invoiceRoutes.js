import express from "express";
import {
    getAllInvoices,
    createInvoice,
    getInvoiceById,
    updateInvoice,
    deleteInvoice,
    checkInvoiceNo,
    getNextInvoiceNo
} from "../controllers/invoiceController.js";



const router = express.Router();

// 📄 GET all invoices
router.get("/invoices", getAllInvoices);

// ➕ POST new invoice with items
router.post("/invoices", createInvoice);

// 🖊️ GET single invoice (for editing)
router.get("/invoices/:id", getInvoiceById);

// 📝 PUT (update) invoice
router.put("/invoices/:id", updateInvoice);

// ❌ DELETE invoice and its items
router.delete("/invoices/:id", deleteInvoice);

// ✅ Check for duplicate invoice number
router.get("/check-invoice/:invoiceNo", checkInvoiceNo);

// 🔢 Get next invoice number
router.get("/next-invoice-no", getNextInvoiceNo);


export default router;
