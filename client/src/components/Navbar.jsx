
// src/components/Navbar.jsx
import React from 'react';
import { AppBar, Toolbar, Typography, Box, Button } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';



function Navbar() {
    const navigate = useNavigate();

    return (
        <AppBar position="sticky" elevation={2} sx={{ backgroundColor: '#1976d2' }}>
            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                {/* Left Side: Title */}

                <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Typography variant="h6" sx={{ fontFamily: 'Poppins, Roboto, sans-serif' }}>
                        Invoice Manager
                    </Typography>
                </Link>

                {/* Center: Navigation Buttons */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button color="inherit" onClick={() => navigate('/stkreport')}>
                        Stock Report
                    </Button>
                    <Button color="inherit" onClick={() => navigate('/purchase')} >
                        Purchase
                    </Button>
                    <Button color="inherit" onClick={() => navigate('/sell')} >
                        Sell
                    </Button>
                    <Button color="inherit" onClick={() => navigate('/firm')}>
                        Firm
                    </Button>
                    <Button color="inherit" onClick={() => navigate('/items')}>
                        Items
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default Navbar;

