import express from "express";
import cors from "cors";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import firmRoutes from "./routes/firmRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import db from "./config/db.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// DB Connection Check
db.connect(err => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL database");
  }
});

// Routes
app.use("/api", invoiceRoutes);  // e.g. /api/invoices/next-invoice-no
app.use("/api", firmRoutes);
app.use("/api", itemRoutes);

// Root Route
app.get("/", (req, res) => {
  res.send("Welcome to the Invoice Backend API 🚀");
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
