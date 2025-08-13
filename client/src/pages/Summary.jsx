import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TableFooter } from "@mui/material";

function Summary() {
    const [rows, setRows] = useState([]);

    useEffect(() => {
        fetch("http://localhost:5000/api/summary")
            .then(res => res.json())
            .then(data => setRows(data))
            .catch(err => console.error(err));
    }, []);

    // Sum numeric values safely using reduce
    const sum = (key) => {
        return rows.reduce((total, row) => {
            const value = parseFloat(row[key]);
            return total + (isNaN(value) ? 0 : value);
        }, 0);
    };

    return (
        <TableContainer component={Paper}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell >Item Name</TableCell>
                        <TableCell align="right">Purchase Qty</TableCell>
                        <TableCell align="right">Sell Qty</TableCell>
                        <TableCell align="right">Balance Qty</TableCell>
                        <TableCell align="right">Purchase Amt</TableCell>
                        <TableCell align="right">Sale Amt</TableCell>
                        <TableCell align="right">Avg Pur Rate</TableCell>
                        <TableCell align="right">Avg Sell Rate</TableCell>
                        <TableCell align="right">Pur Bal Amt</TableCell>
                        <TableCell align="right">Sell Bal Amt</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row, index) => (
                        <TableRow key={index}>
                            <TableCell>{row.itemName}</TableCell>
                            <TableCell align="right">{row.purQty}</TableCell>
                            <TableCell align="right">{row.sellQty}</TableCell>
                            <TableCell align="right">{row.balanceQty}</TableCell>
                            <TableCell align="right">{row.purAmt}</TableCell>
                            <TableCell align="right">{row.saleAmt}</TableCell>
                            <TableCell align="right">{row.avgPurRate}</TableCell>
                            <TableCell align="right">{row.avgSellRate}</TableCell>
                            <TableCell align="right">{row.purBalAmt}</TableCell>
                            <TableCell align="right">{row.sellBalAmt}</TableCell>
                        </TableRow>
                    ))}

                </TableBody>

                <TableRow sx={{ backgroundColor: "#f0f0f0", fontWeight: "bold" }}>
                    <TableCell>Total:</TableCell>
                    <TableCell align="right">{sum("purQty")}</TableCell>
                    <TableCell align="right">{sum("sellQty")}</TableCell>
                    <TableCell align="right">{sum("balanceQty")}</TableCell>
                    <TableCell align="right">{sum("purAmt")?.toFixed(2)}</TableCell>
                    <TableCell align="right">{sum("saleAmt")?.toFixed(2)}</TableCell>
                    <TableCell align="right">{/* Usually avg rates don't sum */}</TableCell>
                    <TableCell align="right">{/* Usually avg rates don't sum */}</TableCell>
                    <TableCell align="right">{sum("purBalAmt")?.toFixed(2)}</TableCell>
                    <TableCell align="right">{sum("sellBalAmt")?.toFixed(2)}</TableCell>
                </TableRow>

            </Table>
        </TableContainer>
    );
}

export default Summary;