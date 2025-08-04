import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import InvoiceList from "./InvoiceList";
import InvoiceForm from "./InvoiceForm";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function App() {
    return (
        <Router>
            <>
                <Routes>
                    <Route path="/" element={<InvoiceList />} />
                    <Route path="/new-invoice" element={<InvoiceForm />} />
                    <Route path="/edit-invoice/:id" element={<InvoiceForm />} />

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
            </>
        </Router>


    );
}

export default App;