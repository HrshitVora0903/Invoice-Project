import db from "../config/db.js"; // adjust the path if needed

export const getSummary = (req, res) => {
    const sql = `
       
    select *, round(case when  balanceQty  > 0 then (balanceQty * avgPurRate) else 0 end,2) as purBalAmt 
	,round(case when  balanceQty  > 0 then (balanceQty * avgSellRate) else 0 end,2) as sellBalAmt 

    from (select * , (purQty - sellQty) as balanceQty
        ,ROUND(case when purQty > 0 then (purAmt)/(purQty) else 0 end ,2 )as avgPurRate
        ,ROUND(case when sellQty > 0 then (sellAmt)/(sellQty) else 0 end ,2 )as avgSellRate
    
        from ( SELECT 
            ii.itemName,
            SUM(CASE WHEN i.type = 'purchase' THEN ii.qty ELSE 0 END) AS purQty,
            SUM(CASE WHEN i.type = 'sell' THEN ii.qty ELSE 0 END) AS sellQty,

            SUM(CASE WHEN i.type = 'purchase' THEN ii.amt ELSE 0 END) AS purAmt,
            SUM(CASE WHEN i.type = 'sell' THEN ii.amt ELSE 0 END) AS sellAmt

            from invoices i
            INNER JOIN invoice_items ii ON i.id = ii.invoiceId
            GROUP BY ii.itemName
        ) as a
    ) as b
        ORDER BY b.itemName
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching summary:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
};



// export const getDetail = (req, res) => {
//     const sql = `
//         SELECT 
//             it.item_name AS itemName,
//             inv.invoice_no AS invoiceNo,
//             inv.date AS date,
//             inv.party_name AS partyName,
//             CASE WHEN inv.type = 'purchase' THEN ii.quantity ELSE NULL END AS purQty,
//             CASE WHEN inv.type = 'sell' THEN ii.quantity ELSE NULL END AS sellQty,
//             CASE WHEN inv.type = 'purchase' THEN ii.amount ELSE NULL END AS purAmt,
//             CASE WHEN inv.type = 'sell' THEN ii.amount ELSE NULL END AS sellAmt,
//             CASE WHEN inv.type = 'purchase' THEN ii.rate ELSE NULL END AS purRate,
//             CASE WHEN inv.type = 'sell' THEN ii.rate ELSE NULL END AS sellRate
//         FROM 
//             items it
//         LEFT JOIN 
//             invoice_items ii ON it.id = ii.item_id
//         LEFT JOIN 
//             invoices inv ON ii.invoice_id = inv.id
//         ${type ? `WHERE inv.type = ?` : ""}
//         ORDER BY 
//             it.item_name, inv.date ASC
//     `;

//     const params = type ? [type] : [];

//     db.query(sql, params, (err, results) => {
//         if (err) {
//             console.error("Error fetching details:", err);
//             return res.status(500).json({ error: "Database error" });
//         }
//         res.json(results);
//     });
// };

// controllers/itemDetailsController.js
export const getDetail = (req, res) => {
    const sql = `
        SELECT 
            ii.itemName AS itemName,
            i.invoiceNo AS invoiceNo,
            DATE_FORMAT(i.date, '%d-%m-%Y') AS date, 
            i.partyName AS partyName,
            CASE WHEN i.type = 'purchase' THEN ii.qty ELSE NULL END AS purQty,
            CASE WHEN i.type = 'sell' THEN ii.qty ELSE NULL END AS sellQty,
            CASE WHEN i.type = 'purchase' THEN ii.amt ELSE NULL END AS purAmt,
            CASE WHEN i.type = 'sell' THEN ii.amt ELSE NULL END AS sellAmt,
            CASE WHEN i.type = 'purchase' THEN ii.rate ELSE NULL END AS purRate,
            CASE WHEN i.type = 'sell' THEN ii.rate ELSE NULL END AS sellRate
        FROM invoices i
        JOIN invoice_items ii ON i.id = ii.invoiceId
        ORDER BY ii.itemName ASC, i.date ASC
    `;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        const grouped = results.reduce((acc, row) => {
            if (!acc[row.itemName]) acc[row.itemName] = [];
            acc[row.itemName].push(row);
            return acc;
        }, {});

        res.json(grouped);
    });
};
