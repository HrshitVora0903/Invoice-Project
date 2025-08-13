// import React, { useEffect, useState } from "react";
// import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box } from "@mui/material";

// function Details() {
//     const [data, setData] = useState({}); // object grouped by item name
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         fetch("http://localhost:5000/api/detail")
//             .then(res => res.json())
//             .then(data => {
//                 setData(data || {});
//                 setLoading(false);
//             })
//             .catch(err => {
//                 console.error(err);
//                 setLoading(false);
//             });
//     }, []);

//     if (loading) {
//         return <Typography variant="h6" sx={{ p: 2 }}>Loading...</Typography>;
//     }

//     if (!Object.keys(data).length) {
//         return <Typography variant="h6" sx={{ p: 2 }}>No data available</Typography>;
//     }

//     return (
//         <Box sx={{ p: 2 }}>
//             <Typography variant="h4" gutterBottom>
//                 Item Details
//             </Typography>

//             {Object.keys(data).map(itemName => (
//                 <Box key={itemName} sx={{ mb: 5 }}>
//                     {/* Group Header */}
//                     <Typography
//                         variant="h6"
//                         sx={{
//                             backgroundColor: "#f5f5f5",
//                             p: 1.5,
//                             borderRadius: 1,
//                             fontWeight: "bold"
//                         }}
//                     >
//                         {itemName}
//                     </Typography>

//                     {/* MUI Table */}
//                     <TableContainer component={Paper} sx={{ mt: 2 }}>
//                         <Table size="small">
//                             <TableHead>
//                                 <TableRow>
//                                     <TableCell>Invoice No</TableCell>
//                                     <TableCell>Date</TableCell>
//                                     <TableCell>Party Name</TableCell>
//                                     <TableCell>Purchase Qty</TableCell>
//                                     <TableCell>Sell Qty</TableCell>
//                                     <TableCell>Purchase Rate</TableCell>
//                                     <TableCell>Sell Rate</TableCell>
//                                     <TableCell>Purchase Amt</TableCell>
//                                     <TableCell>Sell Amt</TableCell>
//                                 </TableRow>
//                             </TableHead>
//                             <TableBody>
//                                 {data[itemName].map((row, idx) => (
//                                     <TableRow key={idx}>
//                                         <TableCell>{row.invoiceNo}</TableCell>
//                                         <TableCell>{row.date}</TableCell>
//                                         <TableCell>{row.partyName}</TableCell>
//                                         <TableCell>{row.purQty || ""}</TableCell>
//                                         <TableCell>{row.sellQty || ""}</TableCell>
//                                         <TableCell>{row.purRate || ""}</TableCell>
//                                         <TableCell>{row.sellRate || ""}</TableCell>
//                                         <TableCell>{row.purAmt || ""}</TableCell>
//                                         <TableCell>{row.sellAmt || ""}</TableCell>
//                                     </TableRow>
//                                 ))}
//                             </TableBody>
//                         </Table>
//                     </TableContainer>
//                 </Box>
//             ))}
//         </Box>
//     );
// }

// export default Details;

import React, { useEffect, useState } from "react";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box,
} from "@mui/material";

function Details() {
    const [data, setData] = useState({}); // object grouped by item name
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("http://localhost:5000/api/detail")
            .then((res) => res.json())
            .then((data) => {
                setData(data || {});
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <Typography variant="h6" sx={{ p: 2 }}>
                Loading...
            </Typography>
        );
    }

    if (!Object.keys(data).length) {
        return (
            <Typography variant="h6" sx={{ p: 2 }}>
                No data available
            </Typography>
        );
    }

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h4" gutterBottom>
                Item Details
            </Typography>

            {Object.keys(data).map((itemName) => {
                const rows = data[itemName];

                // Calculate totals
                const totalInvoices = rows.length;

                const totalPurQty = rows.reduce(
                    (acc, r) => acc + (Number(r.purQty) || 0),
                    0
                );
                const totalSellQty = rows.reduce(
                    (acc, r) => acc + (Number(r.sellQty) || 0),
                    0
                );

                const totalPurAmt = rows.reduce(
                    (acc, r) => acc + (Number(r.purAmt) || 0),
                    0
                );
                const totalSellAmt = rows.reduce(
                    (acc, r) => acc + (Number(r.sellAmt) || 0),
                    0
                );
                const avgPurRate = (totalPurAmt / totalPurQty).toFixed(2);
                const avgSellRate = (totalSellAmt / totalSellQty).toFixed(2);
                const availableQty = totalPurQty - totalSellQty;
                const balancePurAmt = (avgPurRate * availableQty).toFixed(2);
                const balanceSellAmt = (avgSellRate * availableQty).toFixed(2);
                return (
                    <Box key={itemName} sx={{ mb: 5 }}>
                        {/* Group Header */}
                        <Typography
                            variant="h6"
                            sx={{
                                backgroundColor: "#f5f5f5",
                                p: 1.5,
                                borderRadius: 1,
                                fontWeight: "bold",
                            }}
                        >
                            {itemName}
                        </Typography>

                        {/* MUI Table */}
                        <TableContainer component={Paper} sx={{ mt: 2 }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Invoice No</TableCell>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Party Name</TableCell>
                                        <TableCell>Purchase Qty</TableCell>
                                        <TableCell>Sell Qty</TableCell>
                                        <TableCell>Purchase Rate</TableCell>
                                        <TableCell>Sell Rate</TableCell>
                                        <TableCell>Purchase Amt</TableCell>
                                        <TableCell>Sell Amt</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {rows.map((row, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell>{row.invoiceNo}</TableCell>
                                            <TableCell>{row.date}</TableCell>
                                            <TableCell>{row.partyName}</TableCell>
                                            <TableCell>{row.purQty || ""}</TableCell>
                                            <TableCell>{row.sellQty || ""}</TableCell>
                                            <TableCell>{row.purRate || ""}</TableCell>
                                            <TableCell>{row.sellRate || ""}</TableCell>
                                            <TableCell>{row.purAmt || ""}</TableCell>
                                            <TableCell>{row.sellAmt || ""}</TableCell>
                                        </TableRow>
                                    ))}

                                    {/* Totals Row */}
                                    <TableRow
                                        sx={{
                                            backgroundColor: "#e0f7fa",
                                            fontWeight: "bold",
                                        }}
                                    >
                                        <TableCell colSpan={2} sx={{ fontWeight: "bold" }}>
                                            Total:
                                        </TableCell>
                                        <TableCell>{totalInvoices}</TableCell>
                                        <TableCell>{totalPurQty}</TableCell>
                                        <TableCell>{totalSellQty}</TableCell>
                                        <TableCell>{avgPurRate}</TableCell>
                                        <TableCell>{avgSellRate}</TableCell>
                                        <TableCell>{totalPurAmt.toFixed(2)}</TableCell>
                                        <TableCell>{totalSellAmt.toFixed(2)}</TableCell>
                                    </TableRow>

                                    {/* Available Qty Row */}
                                    <TableRow
                                        sx={{
                                            backgroundColor: "#ffe0b2",
                                            fontWeight: "bold",
                                        }}
                                    >
                                        <TableCell colSpan={2} sx={{ fontWeight: "bold" }}>
                                            Balance: {availableQty}
                                        </TableCell>
                                        <TableCell colSpan={2} sx={{ fontWeight: "bold" }}>
                                            Purchase Balance: {balancePurAmt}</TableCell>
                                        <TableCell colSpan={2} sx={{ fontWeight: "bold" }}>
                                            Sell Balance: {balanceSellAmt}</TableCell>
                                        <TableCell colSpan={3}></TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                );
            })}
        </Box>
    );
}

export default Details;
