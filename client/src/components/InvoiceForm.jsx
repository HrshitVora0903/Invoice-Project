import React, { useState } from "react";
import { TextField, Button, Table, TableHead, TableRow, TableCell, TableBody, Box } from '@mui/material';

function InvoiceForm() {
    const [invoiceNo, setInvoiceNo] = useState("");
    const [partyName, setPartyName] = useState("");
    const [gstNo, setGstNo] = useState("");
    const [date, setDate] = useState(() => {
        const d = new Date();
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${year}-${month}-${day}`;
    });

    const [items, setItems] = useState([
        { itemName: "", qty: "", rate: "", amt: "", gstP: "", gstAmt: "", netAmt: "" }
    ]);

    const handleChange = (index, event) => {
        const { name, value } = event.target;
        const updatedItems = [...items];
        updatedItems[index][name] = value;
        setItems(updatedItems);

        const qty = parseFloat(updatedItems[index].qty);
        let rate = parseFloat(updatedItems[index].rate);
        let gstP = parseFloat(updatedItems[index].gstP);
        let amt = parseFloat(updatedItems[index].amt);
        let netAmt = parseFloat(updatedItems[index].netAmt);

        if (name === "amt") {
            if (qty !== 0 && !isNaN(amt)) {
                rate = amt / qty;
                updatedItems[index].rate = rate.toFixed(2);
            }
        } else if (name === "qty" || name === "rate") {
            if (!isNaN(qty) && !isNaN(rate)) {
                amt = qty * rate;
                updatedItems[index].amt = amt.toFixed(2);
            }
        }

        if (!isNaN(amt) && !isNaN(gstP)) {
            const gstAmt = (amt * gstP) / 100;
            updatedItems[index].gstAmt = gstAmt.toFixed(2);
            netAmt = amt + gstAmt;
            updatedItems[index].netAmt = netAmt.toFixed(2);
        }

        if (name === "netAmt") {
            updatedItems[index][name] = value;
            setItems(updatedItems);

            const newNetAmt = parseFloat(value);
            if (!isNaN(newNetAmt) && !isNaN(rate) && !isNaN(netAmt) && netAmt !== 0) {
                const newRate = (newNetAmt * rate) / netAmt;
                updatedItems[index].rate = newRate.toFixed(2);

                const newAmt = qty * newRate;
                updatedItems[index].amt = newAmt.toFixed(2);
                const newGstAmt = (newAmt * gstP) / 100;
                updatedItems[index].gstAmt = newGstAmt.toFixed(2);
            }
        }

        setItems(updatedItems);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === "invoiceNo") setInvoiceNo(value);
        else if (name === "partyName") setPartyName(value);
        else if (name === "gstNo") setGstNo(value);
        else if (name === "date") setDate(value);
    };

    const handleAddedItem = () => {
        setItems([...items, { itemName: "", qty: "", rate: "", amt: "", gstP: "", gstAmt: "", netAmt: "" }]);
    };

    const SubmitNote = (e) => {
        e.preventDefault();

        
        if (!partyName.trim()) {
            alert("Please enter Party Name!");
            return;
        }

        if (!invoiceNo.trim()) {
            alert("Please enter Invoice Number!");
            return;
        }

        const gstRegex= /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
        if (!gstNo.trim()) {
            alert("Please enter GST Number!");
            return;
        } else if( !gstRegex.test(gstNo.trim().toUpperCase())){
            alert("Please enter a valid 15-digit GST Number!");
            return;
        }

        // You can also validate at least one item name
        const emptyItem = items.find(item => !item.itemName.trim());
        if (emptyItem) {
            alert("Please enter Item Name!");
            return;
        }


        const [y, m, d] = date.split("-");
        const formattedDate = `${d}-${m}-${y}`;
        const invoice = {
            invoiceNo,
            partyName,
            gstNo,
            date: formattedDate,
            items
        };
        console.log(invoice);
    };

    function CleanNote() {
        const confirmReset = window.confirm("Are you sure you want to reset the invoice?");
        if (!confirmReset) return;

        setInvoiceNo("");
        setPartyName("");
        setGstNo("");
        const d = new Date();
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        setDate(`${year}-${month}-${day}`);
        setItems([
            { itemName: "", qty: "", rate: "", amt: "", gstP: "", gstAmt: "", netAmt: "" }
        ])
    };

    const handleDeleteItem = (indexToDelete) => {
        if (items.length === 1) {
            alert("At least one item is required.");
            return;
        }

        const confirmDelete = window.confirm("Are you sure you want to delete this item?");
        if (confirmDelete) {
            const updatedItems = items.filter((_, index) => index !== indexToDelete);
            setItems(updatedItems);
        }
    };





    return (
        <form onSubmit={SubmitNote} onReset={CleanNote} style={{ padding: '20px' }}>
            <TextField label="Invoice No" name="invoiceNo" value={invoiceNo} onChange={handleInputChange} margin="normal" fullWidth />
            <TextField label="Party Name" name="partyName" value={partyName} onChange={handleInputChange} margin="normal" fullWidth />
            <TextField label="GST No." name="gstNo" value={gstNo} onChange={handleInputChange} margin="normal" fullWidth />
            <TextField
                label="Date"
                name="date"
                type="date"
                value={date}
                onChange={handleInputChange}
                margin="normal"
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2 }}>
                <Button variant="contained" onClick={handleAddedItem} sx={{ mr: 2 }}>
                    Add Item
                </Button>
            </Box>


            <Table sx={{ mt: 4 }} size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Action</TableCell>
                        <TableCell>Item Name</TableCell>
                        <TableCell>Qty</TableCell>
                        <TableCell>Rate</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>GST%</TableCell>
                        <TableCell>GST Amt</TableCell>
                        <TableCell>Net Amt</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {items.map((item, index) => (
                        <TableRow key={index}>
                            <TableCell>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={() => handleDeleteItem(index)}
                                >
                                    Delete
                                </Button>
                            </TableCell>

                            <TableCell>
                                <TextField name="itemName" value={item.itemName} onChange={(e) => handleChange(index, e)} />
                            </TableCell>
                            <TableCell>
                                <TextField name="qty" value={item.qty} onChange={(e) => handleChange(index, e)} />
                            </TableCell>
                            <TableCell>
                                <TextField name="rate" value={item.rate} onChange={(e) => handleChange(index, e)} />
                            </TableCell>
                            <TableCell>
                                <TextField name="amt" value={item.amt} onChange={(e) => handleChange(index, e)} />
                            </TableCell>
                            <TableCell>
                                <TextField name="gstP" value={item.gstP} onChange={(e) => handleChange(index, e)} />
                            </TableCell>
                            <TableCell>
                                <TextField name="gstAmt" value={item.gstAmt} onChange={(e) => handleChange(index, e)} disabled />
                            </TableCell>
                            <TableCell>
                                <TextField name="netAmt" value={item.netAmt} onChange={(e) => handleChange(index, e)} />
                            </TableCell>
                        </TableRow>
                    ))}


                    {/* Totals Row */}
                    <TableRow sx={{ backgroundColor: "#f0f0f0", fontWeight: "bold" }}>
                        <TableCell><b>Total:</b></TableCell>
                        <TableCell>{items.length}</TableCell>
                        <TableCell>
                            {items.reduce((sum, item) => sum + (parseFloat(item.qty) || 0), 0)}
                        </TableCell>
                        <TableCell /> {/* Empty Rate Total */}
                        <TableCell>
                            {items.reduce((sum, item) => sum + (parseFloat(item.amt) || 0), 0).toFixed(2)}
                        </TableCell>
                        <TableCell /> {/* Empty GST% Total */}
                        <TableCell>
                            {items.reduce((sum, item) => sum + (parseFloat(item.gstAmt) || 0), 0).toFixed(2)}
                        </TableCell>
                        <TableCell>
                            {items.reduce((sum, item) => sum + (parseFloat(item.netAmt) || 0), 0).toFixed(2)}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>

            <h3 style={{ marginTop: "20px" }}>
                Total Net Amount: {
                    items.reduce((acc, item) => {
                        const value = parseFloat(item.netAmt);
                        if (!isNaN(value)) acc += value;
                        return acc;
                    }, 0).toFixed(2)
                }
            </h3>

            <Button type="reset" variant="contained" color="primary" sx={{ mt: 2, mr: 2 }}>Reset</Button>
            <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>Submit</Button>
        </form>
    );
}

export default InvoiceForm;
