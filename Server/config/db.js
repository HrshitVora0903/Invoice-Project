import mysql from "mysql2";

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'invoice_app'
});

db.connect(err => {
    if (err) {
        console.error("❌ DB Connection Error:", err);
    } else {
        console.log("✅ MySQL Connected");
    }
});

export default db;
