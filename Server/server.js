const express = require("express");
var cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
// const { use } = require("react");

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root', // most common default
  password: 'root',
  database: 'invoice_app'
});

connection.connect( err => {
  if(!err){
    console.log("Connected Database")
  }else {
    console.log(err);
  }
})

const app = express()
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());
var invoices =[];

// get all invoices
app.get("/", function(req,res){
    res.json(invoices);
});

// POST new invoice(Memory  Version)
// app.post('/invoices', function (req, res) {
//   const newInvoice = req.body;

//   // find used number
//   var usedNumbers = invoices.map(function(inv) {
//     return parseInt(inv.invoiceNo, 10);
//   });

//   //find maximum number
//   var maxInvo = usedNumbers.length > 0 ? Math.max.apply(null, usedNumbers) : -1;


//   if (newInvoice.invoiceNo && newInvoice.invoiceNo !== ""){
//     var enteredNo = parseInt(newInvoice.invoiceNo,10);

//     if(usedNumbers.includes(enteredNo)){
//        return res.status(400).json({ message: "Invoice number already exists." });
//     }
//     newInvoice.invoiceNo= enteredNo.toString();
//     } else {
//       newInvoice.invoiceNo = (maxInvo + 1).toString();
//     }


//   newInvoice.id = Date.now().toString();
//   invoices.push(newInvoice);
//   res.status(201).json({ message: 'Invoice added', invoice: newInvoice });
// });








//delete invoices
app.delete('/invoices/:id', function (req, res) {
  const id = req.params.id;
  const initialLength = invoices.length;

  invoices = invoices.filter(function (inv) {
    return inv.id !== id;
  });

  if (invoices.length < initialLength) {
    res.json({ message: 'Invoice deleted' });
  } else {
    res.status(404).json({ message: 'Invoice not found' });
  }
});


app.get("/invoices/:id", function (req, res) {
  const id = req.params.id;

  const invoice = invoices.find(inv => inv.id === id);

  if (!invoice) {
    return res.status(404).json({ message: "Invoice not found" });
  }

  res.json(invoice);
});

//edit invoices
app.put('/invoices/:id', function (req, res) {
  var id = req.params.id;
  var updatedInvoice = req.body;
  var found = false;

  invoices = invoices.map(function (invoice) {
    if (invoice.id === id) {
      found = true;
      updatedInvoice.id = id; // Keep the same ID
      return updatedInvoice;
    }
    return invoice;
  });

  if (found) {
    res.json({ message: 'Invoice updated successfully' });
  } else {
    res.status(404).json({ message: 'Invoice not found' });
  }
});



app.listen(5000, function () {
    console.log("this 5000 port");
});