import React, { useState, useEffect } from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import {
    Button, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Box, Typography, Dialog,
    DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Paper,
    FormControl, InputLabel, Select
} from '@mui/material';
import { toast } from 'react-toastify';
import ConfirmDialog from '../components/ConfirmDialog';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';





const statesOfIndia = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
    "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

function FirmList() {
    const [firms, setFirms] = useState([]);
    const [open, setOpen] = useState(false);
    const [newFirm, setNewFirm] = useState({
        partyName: '',
        gstNo: '',
        state: '',
        personName: '',
        status: 'Active',
        mobile: '',
        email: ''
    });
    const [editingFirmId, setEditingFirmId] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedFirmId, setSelectedFirmId] = useState(null);



    useEffect(() => {
        // Load firms on component mount
        fetch("http://localhost:5000/api/firms")
            .then(res => res.json())
            .then(data => setFirms(data))
            .catch(err => console.error("Error loading firms:", err));
    }, []);

    const handleChange = (e) => {
        setNewFirm({ ...newFirm, [e.target.name]: e.target.value });
    };

    const handleAddOrUpdateFirm = () => {
        const { partyName, gstNo, state, personName, status, mobile, email } = newFirm;

        // GST validation
        const gstRegex = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
        if (!gstNo.trim()) {
            toast.warning("Please enter GST Number!");
            return;
        } else if (!gstRegex.test(gstNo.trim().toUpperCase())) {
            toast.warning("Please enter a valid 15-digit GST Number!");
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email.trim() && !emailRegex.test(email.trim())) {
            toast.warning("Please enter a valid Email address!");
            return;
        }

        // Mobile validation
        const phoneRegex = /^[6-9]\d{9}$/;
        if (mobile.trim() && !phoneRegex.test(mobile.trim())) {
            toast.warning("Please enter a valid 10-digit Mobile Number starting with 6-9!");
            return;
        }


        const firmPayload = {
            partyName: partyName,
            gstNo: gstNo.trim().toUpperCase(),
            state,
            personName,
            status: status.toLowerCase(),
            mobile,
            email
        };

        if (editingFirmId !== null) {
            // EDIT mode
            fetch(`http://localhost:5000/api/firms/${editingFirmId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(firmPayload)
            })
                .then(res => res.json())
                .then(updatedFirm => {
                    setFirms(firms.map(firm => firm.id === editingFirmId ? updatedFirm : firm));
                    setEditingFirmId(null);
                    setOpen(false);
                    resetForm();
                    toast.success("Firm updated successfully!");
                })
                .catch(err => {
                    console.error("Update failed:", err);
                    toast.error("Error updating firm.");
                });
        } else {
            // ADD mode
            fetch("http://localhost:5000/api/firms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(firmPayload)
            })
                .then(res => res.json())
                .then(savedFirm => {
                    setFirms([...firms, savedFirm]);
                    setOpen(false);
                    resetForm();
                    toast.success("Firm added successfully!");
                })
                .catch(err => {
                    console.error("Add failed:", err);
                    toast.error("Error adding firm.");
                });
        }
    };



    const resetForm = () => {
        setNewFirm({
            partyName: '',
            gstNo: '',
            state: '',
            personName: '',
            status: 'Active',
            mobile: '',
            email: ''
        });
    };


    const handleDelete = (id) => {
        setSelectedFirmId(id);
        setConfirmOpen(true);
    };

    const confirmDelete = () => {
        fetch(`http://localhost:5000/api/firms/${selectedFirmId}`, {
            method: 'DELETE'
        })
            .then(res => {
                if (!res.ok) throw new Error('Failed to delete firm');
                setFirms(firms.filter(firm => firm.id !== selectedFirmId));
                toast.success('Firm deleted successfully!');
            })
            .catch(err => {
                console.error("Delete failed:", err);
                toast.error('Error deleting firm');
            })
            .finally(() => {
                setConfirmOpen(false);
                setSelectedFirmId(null);
            });
    };


    const handleEditClick = (firm) => {
        setNewFirm({
            partyName: firm.partyName,
            gstNo: firm.gstNo,
            state: firm.state,
            personName: firm.personName,
            status: firm.status === 'active' ? 'Active' : 'Inactive',
            mobile: firm.mobile,
            email: firm.email
        });
        setEditingFirmId(firm.id);
        setOpen(true);
    };



    return (
        <Box sx={{ padding: '20px' }}>
            <Typography
                variant="h4"
                sx={{
                    fontWeight: 500,
                    fontSize: '2.5rem',
                    fontFamily: `'Poppins', 'Roboto', 'Segoe UI', sans-serif`,
                    color: 'text.primary',
                    letterSpacing: '0.5px',
                    mb: 0
                }}
            >
                Firm List
            </Typography>

            <Box sx={{ mb: 2, mt: 2 }}>
                <Button
                    variant="contained"
                    size="small"
                    sx={{
                        padding: '4px 12px',
                        fontSize: '0.8rem',
                        textTransform: 'none',
                        fontFamily: `'Poppins', 'Roboto', sans-serif`,
                    }}
                    onClick={() => setOpen(true)}
                >
                    Add Firm
                </Button>
            </Box>
            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Actions</TableCell>
                            <TableCell>Party Name</TableCell>
                            <TableCell>GST No</TableCell>
                            <TableCell>State</TableCell>
                            <TableCell>Person Name</TableCell>
                            <TableCell>Mobile</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {firms.map((firm, index) => (
                            <TableRow key={index}>

                                <TableCell>
                                    <IconButton color="primary" size="small" onClick={() => handleEditClick(firm)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton color="error" size="small" onClick={() => handleDelete(firm.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>

                                <TableCell>{firm.partyName}</TableCell>
                                <TableCell>{firm.gstNo}</TableCell>
                                <TableCell>{firm.state}</TableCell>
                                <TableCell>{firm.personName}</TableCell>
                                <TableCell>{firm.mobile}</TableCell>
                                <TableCell>{firm.email}</TableCell>
                                <TableCell>
                                    {firm.status === 'active' ? (
                                        <CheckCircleIcon sx={{ color: 'green' }} />
                                    ) : (
                                        <CancelIcon sx={{ color: 'red' }} />
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* ADD FIRM DIALOG */}
            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>{editingFirmId !== null ? "Edit Firm" : "Add Firm"}</DialogTitle>

                <DialogContent>
                    <TextField
                        fullWidth margin="dense" name="partyName" label="Party Name"
                        value={newFirm.partyName} onChange={handleChange}
                    />
                    <TextField
                        fullWidth margin="dense" name="gstNo" label="GST No"
                        value={newFirm.gstNo} onChange={handleChange}
                    />
                    <FormControl fullWidth margin="dense">
                        <InputLabel id="state-label">State</InputLabel>
                        <Select
                            labelId="state-label"
                            id="state"
                            name="state"
                            value={newFirm.state}
                            label="State"
                            onChange={handleChange}
                            MenuProps={{
                                disableAutoFocusItem: true,
                                PaperProps: {
                                    style: {
                                        maxHeight: 300,
                                        overflowY: 'auto',
                                    },
                                },
                            }}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                setTimeout(() => {
                                    const el = document.getElementById("state");
                                    if (el) el.click();
                                }, 0);
                            }}
                        >
                            {statesOfIndia.map((state) => (
                                <MenuItem key={state} value={state}>
                                    {state}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>



                    <TextField
                        fullWidth margin="dense" name="personName" label="Person Name"
                        value={newFirm.personName} onChange={handleChange}
                    />

                    <TextField
                        fullWidth margin="dense" name="mobile" label="Mobile"
                        value={newFirm.mobile} onChange={handleChange}
                    />
                    <TextField
                        fullWidth margin="dense" name="email" label="Email"
                        value={newFirm.email} onChange={handleChange}
                    />
                    <TextField
                        select fullWidth margin="dense" name="status" label="Status"
                        value={newFirm.status} onChange={handleChange}
                    >
                        <MenuItem value="Active">Active</MenuItem>
                        <MenuItem value="Inactive">Inactive</MenuItem>
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleAddOrUpdateFirm}>Add</Button>
                </DialogActions>
            </Dialog>
            <ConfirmDialog
                open={confirmOpen}
                title="Delete Firm"
                message="Are you sure you want to delete this firm?"
                onCancel={() => setConfirmOpen(false)}
                onConfirm={confirmDelete}
            />

        </Box>
    );
}

export default FirmList;
