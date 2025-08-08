import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import InvoiceList from "./InvoiceList";
import InvoiceForm from "./InvoiceForm";
import ItemList from "./ItemList";
import FirmList from "./FirmList";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from "./Navbar";
import Home from './Home';




function App() {
    return (

        <Router>

            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/invoice" element={<InvoiceList />} />
                <Route path="/new-invoice" element={<InvoiceForm />} />
                <Route path="/edit-invoice/:id" element={<InvoiceForm />} />
                <Route path="/firm" element={<FirmList />} />
                <Route path="/items" element={<ItemList />} />

            </Routes>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                pauseOnHover
                draggable
                theme="colored"
            />

        </Router>


    );
}

export default App;