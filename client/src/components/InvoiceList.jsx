
import React, { useEffect, useState } from 'react';
import { Button, Table, TableHead, TableRow, TableCell, TableBody, Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import ConfirmDialog from './ConfirmDialog';




function InvoiceList() {
    const [invoices, setInvoices] = useState([]);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);

    const navigate = useNavigate();
    var location = useLocation();

    useEffect(() => {
        fetch("http://localhost:5000/api/allinvoices")
            .then(res => res.json())
            .then(data => {
                console.log(data, "-------------------------------");

                setInvoices(data)
            })
            .catch(err => console.error("Failed to fetch invoices:", err));
    }, [location]);

    function promptDelete(id) {
        setSelectedInvoiceId(id);
        setConfirmOpen(true);
    }

    function confirmDeleteInvoice() {
        if (!selectedInvoiceId) return;

        fetch("http://localhost:5000/api/invoice/" + selectedInvoiceId, {
            method: "DELETE"
        })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to delete invoice");
                return res.json();
            })
            .then(() => {
                const updated = invoices.filter((inv) => inv.id !== selectedInvoiceId);
                setInvoices(updated);
                toast.success("Invoice deleted");
            })
            .catch((err) => {
                console.error("Error deleting invoice:", err);
                toast.error("Failed to delete invoice");
            })
            .finally(() => {
                setConfirmOpen(false);
                setSelectedInvoiceId(null);
            });
    }



    return (

        <Box sx={{ padding: '20px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <h2>Invoice List</h2>
                <Button variant="contained"
                    onClick={() => navigate("/new-invoice")}>
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
                                    onClick={() => promptDelete(inv.id)}

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
            <ConfirmDialog
                open={confirmOpen}
                title="Delete Invoice"
                message="Are you sure you want to delete this invoice?"
                onCancel={() => setConfirmOpen(false)}
                onConfirm={confirmDeleteInvoice}
            />

        </Box >

    );
}

export default InvoiceList;
