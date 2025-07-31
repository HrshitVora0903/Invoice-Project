import React  from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import InvoiceList from "./InvoiceList";
import InvoiceForm from "./InvoiceForm";


function App(){
    return (
        <Router>
      <Routes>
        <Route path="/" element={<InvoiceList />} />
        <Route path="/new-invoice" element={<InvoiceForm />} />
        <Route path="/edit-invoice/:id" element={<InvoiceForm />} />

      </Routes>
    </Router>
    );
}

export default App;