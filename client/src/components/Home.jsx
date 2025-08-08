import React from 'react';
import Navbar from './Navbar';
import { Box, Typography } from '@mui/material';

const Home = () => {
    return (
        <>

            <Box sx={{ padding: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Welcome to the Invoice Management System
                </Typography>
                <Typography variant="body1">
                    Use the navigation bar above to manage invoices, firms, and items.
                </Typography>
            </Box>
        </>
    );
};

export default Home;
