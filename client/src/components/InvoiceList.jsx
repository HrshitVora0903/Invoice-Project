
import React, { useEffect, useState } from 'react';
import { Button, Table, TableHead, TableRow, TableCell, TableBody, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function InvoiceList() {
    const [invoices, setInvoices] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetch("http://localhost:5000/api/allinvoices")
            .then(res => res.json())
            .then(data => setInvoices(data))
            .catch(err => console.error("Failed to fetch invoices:", err));
    }, []);

    function handleDelete(id) {
    var confirmDelete = window.confirm("Are you sure you want to delete this invoice?");
    if (confirmDelete) {
        fetch("http://localhost:5000/api/invoice/" + id, {
            method: "DELETE"
        })
        .then(function (res) {
            if (!res.ok) {
                throw new Error("Failed to delete invoice");
            }
            return res.json();
        })
        .then(function () {
            var updatedInvoices = invoices.filter(function (inv) {
                return inv.id !== id;
            });
            setInvoices(updatedInvoices);
        })
        .catch(function (err) {
            console.error("Error deleting invoice:", err);
            alert("Failed to delete invoice");
        });
    }
}


    return (
        <Box sx={{ padding: '20px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <h2>Invoice List</h2>
                <Button variant="contained" onClick={() => navigate("/new-invoice")}>
                    Add Invoice
                </Button>
            </Box>

            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Actions</TableCell>
                        <TableCell>Invoice No</TableCell>
                        <TableCell>Party Name</TableCell>
                        <TableCell>GST No</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>GST Amount</TableCell>
                        <TableCell>Net Amount</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {invoices.map((inv, index) => (
                        <TableRow key={index}>
                            <TableCell>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    color="primary"
                                    onClick={function () { navigate("/edit-invoice/" + inv.id); }}
                                    sx={{ mr: 1 }}
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    color="error"
                                    onClick={function () { handleDelete(inv.id); }}
                                >
                                    Delete
                                </Button>
                            </TableCell>
                            <TableCell>{inv.invoiceNo}</TableCell>
                            <TableCell>{inv.partyName}</TableCell>
                            <TableCell>{inv.gstNo}</TableCell>
                            <TableCell>{inv.date}</TableCell>
                            <TableCell>{inv.amt}</TableCell>
                            <TableCell>{inv.gstAmt}</TableCell>
                            <TableCell>{inv.netAmt}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Box>
    );
}

export default InvoiceList;
