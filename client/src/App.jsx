import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import InvoiceList from "./pages/InvoiceList";
import InvoiceForm from "./pages/InvoiceForm";
import FirmList from "./pages/FirmList";
import ItemList from "./pages/ItemList";
import Navbar from "./components/Navbar";
import StockReport from "./pages/StockReport";


function App() {
    return (
        <Router>
            <Navbar />
            <Routes>

                <Route path="/" element={<Home />} />

                {/* Invoice (Sell) */}
                <Route path="/sell" element={<InvoiceList />} />
                <Route path="/sell/add-invoice" element={<InvoiceForm />} />
                <Route path="/sell/edit-invoice/:id" element={<InvoiceForm />} />

                {/* Purchase */}
                <Route path="/purchase" element={<InvoiceList />} />
                <Route path="/purchase/add-invoice" element={<InvoiceForm />} />
                <Route path="/purchase/edit-invoice/:id" element={<InvoiceForm />} />

                {/* Master Data */}
                <Route path="/firm" element={<FirmList />} />
                <Route path="/items" element={<ItemList />} />

                {/* Stock Report */}
                <Route path="/stkreport" element={<StockReport />} />
            </Routes>
        </Router>
    );
}

export default App;
