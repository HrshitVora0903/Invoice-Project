import React, { useState } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import Summary from "./Summary";
import Detail from "./Detail";

function StockReport() {
    const [value, setValue] = useState(0);

    return (
        <Box sx={{ width: "100%" }}>
            {/* Horizontal Tabs */}
            <Tabs
                value={value}
                onChange={(e, newValue) => setValue(newValue)}
                sx={{ borderBottom: 1, borderColor: "divider" }}
            >
                <Tab label="Summary" />
                <Tab label="Detail" />
            </Tabs>

            {/* Tab Content */}
            <Box sx={{ p: 2 }}>
                {value === 0 && <Summary />}
                {value === 1 && <Detail />}
            </Box>
        </Box>
    );
}

export default StockReport;
