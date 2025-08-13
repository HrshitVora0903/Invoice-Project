// src/components/ItemList.jsx
import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, MenuItem, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, IconButton
} from '@mui/material';
import { CheckCircle, Cancel, Edit, Delete } from '@mui/icons-material';
import { toast } from 'react-toastify';
import ConfirmDialog from '../components/ConfirmDialog';

const ItemList = () => {
    const [items, setItems] = useState([]);
    const [open, setOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [form, setForm] = useState({ itemName: '', hsnCode: '', status: 'active' });
    const [confirmDialog, setConfirmDialog] = useState({ open: false, itemId: null });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = () => {
        fetch('http://localhost:5000/api/items')
            .then(res => res.json())
            .then(data => setItems(data))
            .catch(err => toast.error('Failed to fetch items'));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!form.itemName.trim()) newErrors.itemName = "Item Name is required";
        if (!form.hsnCode.trim()) newErrors.hsnCode = "HSN Code is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleOpen = () => {
        setForm({ itemName: '', hsnCode: '', status: 'active' });
        setEditingItem(null);
        setOpen(true);
    };

    const handleEdit = (item) => {
        setForm(item);
        setEditingItem(item.id);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditingItem(null);
    };

    const handleSubmit = () => {
        if (!validateForm()) {
            toast.error("Please fill all required fields.");
            return;
        }
        // Duplicate check (case-insensitive, exact match)
        const isDuplicate = items.some(item =>
            item.itemName.trim().toLowerCase() === form.itemName.trim().toLowerCase() &&
            item.id !== editingItem // allow same name if editing same record
        );

        if (isDuplicate) {
            toast.error("Item already exists.");
            return;
        }

        const method = editingItem ? 'PUT' : 'POST';
        const url = editingItem
            ? `http://localhost:5000/api/items/${editingItem}`
            : 'http://localhost:5000/api/items';

        fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form)
        })
            .then(res => {
                if (!res.ok) throw new Error('Failed to save item');
                return res.json();
            })
            .then(() => {
                toast.success(`Item ${editingItem ? 'updated' : 'added'} successfully`);
                handleClose();
                fetchItems();
            })
            .catch(err => toast.error(err.message));
    };


    const handleDelete = () => {
        fetch(`http://localhost:5000/api/items/${confirmDialog.itemId}`, {
            method: 'DELETE'
        })
            .then(res => {
                if (!res.ok) throw new Error('Delete failed');
                toast.success('Item deleted');
                setConfirmDialog({ open: false, itemId: null });
                fetchItems();
            })
            .catch(err => toast.error(err.message));
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" fontFamily="Poppins, Roboto, sans-serif" gutterBottom>
                Item List
            </Typography>

            <Button variant="contained" onClick={handleOpen} sx={{ mb: 2 }}>
                Add Item
            </Button>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell align="center">Actions</TableCell>
                            <TableCell align="center">Item Name</TableCell>
                            <TableCell align="center">HSN Code</TableCell>
                            <TableCell align="center">Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {items.map(item => (
                            <TableRow key={item.id}>
                                <TableCell align="center">
                                    <IconButton size="small" color="primary" onClick={() => handleEdit(item)}>
                                        <Edit />
                                    </IconButton>
                                    <IconButton size="small" color="error"
                                        onClick={() => setConfirmDialog({ open: true, itemId: item.id })}
                                    >
                                        <Delete />
                                    </IconButton>
                                </TableCell>
                                <TableCell align="center">{item.itemName}</TableCell>
                                <TableCell align="center">{item.hsnCode}</TableCell>
                                <TableCell align="center">
                                    {item.status === 'active'
                                        ? <CheckCircle color="success" />
                                        : <Cancel color="error" />}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Add/Edit Dialog */}
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{editingItem ? 'Edit Item' : 'Add Item'}</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Item Name"
                        name="itemName"
                        fullWidth
                        value={form.itemName}
                        onChange={handleChange}
                        margin="dense"
                    />
                    <TextField
                        label="HSN Code"
                        name="hsnCode"
                        fullWidth
                        value={form.hsnCode}
                        onChange={handleChange}
                        margin="dense"
                    />
                    <TextField
                        label="Status"
                        name="status"
                        select
                        fullWidth
                        value={form.status}
                        onChange={handleChange}
                        margin="dense"
                    >
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="inactive">Inactive</MenuItem>
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit}>
                        {editingItem ? 'Update' : 'Add'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                open={confirmDialog.open}
                title="Delete Item"
                message="Are you sure you want to delete this item?"
                onCancel={() => setConfirmDialog({ open: false, itemId: null })}
                onConfirm={handleDelete}
            />
        </Box>
    );
};

export default ItemList;
