"use client";

import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Home() {
  const [customer, setCustomer] = useState({ name: "", mobile: "", email: "" });
  const [totalEntries, setTotalEntries] = useState(null);
  const [currentEntryIndex, setCurrentEntryIndex] = useState(1);
  const [entries, setEntries] = useState([]);
  const [formData, setFormData] = useState({
    carNumber: "",
    particulars: "",
    amount: "",
    numberOfDays: "",
    fromDate: null,
    toDate: null,
  });

  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({ ...prev, [name]: value }));
  };

  const handleStart = (e) => {
    e.preventDefault();
    if (totalEntries > 0) setCurrentEntryIndex(1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name, date) => {
    setFormData((prev) => ({ ...prev, [name]: date }));
  };

  const resetForm = () => {
    setFormData({
      carNumber: "",
      particulars: "",
      amount: "",
      numberOfDays: "",
      fromDate: null,
      toDate: null,
    });
  };

  const handleNext = () => {
    setEntries((prev) => [...prev, formData]);
    resetForm();
    setCurrentEntryIndex((prev) => prev + 1);
  };

  const numberToWords = (num) => {
    const a = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const b = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    if (num === 0) return "Zero Rupees Only";

    const inWords = (n) => {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + " " + a[n % 10];
      if (n < 1000)
        return a[Math.floor(n / 100)] + " Hundred " + inWords(n % 100);
      if (n < 100000)
        return inWords(Math.floor(n / 1000)) + " Thousand " + inWords(n % 1000);
      return "Amount too large";
    };

    return inWords(num).trim() + " Rupees Only";
  };

  const handleSubmitAll = () => {
    const finalEntries = [...entries, formData]; // Include the last form data
    generatePDF(finalEntries);
    setTotalEntries(null);
    setEntries([]);
    resetForm();
    setCurrentEntryIndex(0);
  };

  const generatePDF = (data) => {
    const doc = new jsPDF();
    const billNo = `INV${Date.now()}`;

    doc.setFontSize(18);
    doc.text("Tirupati Travels", 105, 15, null, null, "center");
    doc.setFontSize(12);
    doc.text("2/3, Tyagi Road, Prince Chowk, Dehradun (U.K.)", 105, 22, null, null, "center");
    doc.text("Mob.: 9412984847, 8630207638", 105, 28, null, null, "center");

    doc.setFontSize(14);
    doc.text(`Invoice - ${billNo}`, 105, 38, null, null, "center");

    doc.setFontSize(12);
    doc.text(`Customer Name: ${customer.name}`, 15, 50);
    doc.text(`Mobile: ${customer.mobile}`, 15, 58);
    doc.text(`Email: ${customer.email}`, 15, 66);

    const rows = data.map((entry) => [
      entry.carNumber,
      entry.particulars,
      entry.amount,
      entry.numberOfDays,
      entry.fromDate ? new Date(entry.fromDate).toLocaleDateString() : "",
      entry.toDate ? new Date(entry.toDate).toLocaleDateString() : "",
    ]);

    const totalAmount = data.reduce(
      (sum, item) => sum + parseFloat(item.amount || 0),
      0
    );

    autoTable(doc, {
      head: [["Car No", "Particulars", "Amount", "Days", "From", "To"]],
      body: rows,
      startY: 75,
      showFootnotes: false, // DISABLE superscript footnotes
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    const marginLeft = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxWidth = pageWidth - marginLeft * 2;

    doc.setFont("helvetica", "normal");
    const words = numberToWords(totalAmount);
    const inWordsText = `In Words: ${words}`;
    const splitText = doc.splitTextToSize(inWordsText, maxWidth);
    doc.text(splitText, marginLeft, finalY);

    doc.setFont("helvetica", "bold");
    const totalAmountText = `Total Amount: ₹${totalAmount.toFixed(2)}`;
    // Place it below the "In Words" text block with some spacing (approx 7 units per line)
    const totalAmountY = finalY + splitText.length * 7 + 10;
    doc.text(totalAmountText, marginLeft, totalAmountY);
  console.log("total amt", totalAmount);

    doc.save(`${billNo}.pdf`);
  };


  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Tirupati Travels</h1>
        <p>2/3, Tyagi Road, Prince Chowk, Dehradun (U.K.)</p>
        <p>Mob.: 9412984847, 8630207638</p>
      </div>

      {!totalEntries && (
        <form onSubmit={handleStart} style={styles.formCard}>
          <h3 style={styles.sectionTitle}>Customer Information</h3>
          <input
            type="text"
            name="name"
            placeholder="Customer Name"
            value={customer.name}
            onChange={handleCustomerChange}
            required
            style={styles.input}
          />
          <input
            type="text"
            name="mobile"
            placeholder="Mobile Number"
            value={customer.mobile}
            onChange={handleCustomerChange}
            required
            style={styles.input}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={customer.email}
            onChange={handleCustomerChange}
            required
            style={styles.input}
          />
          <label style={styles.label}>Number of Entries</label>
          <input
            type="number"
            value={totalEntries || ""}
            onChange={(e) => setTotalEntries(parseInt(e.target.value))}
            min={1}
            required
            style={styles.input}
          />
          <button type="submit" style={styles.button}>
            Start
          </button>
        </form>
      )}

      {totalEntries && currentEntryIndex > 0 && currentEntryIndex <= totalEntries && (
        <div style={styles.formCard}>
          <h2 style={styles.sectionTitle}>
            Entry {currentEntryIndex} of {totalEntries}
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (currentEntryIndex < totalEntries) {
                handleNext(); // Normal next
              } else if (currentEntryIndex === totalEntries) {
                // Last entry — add it and generate
                setEntries((prev) => [...prev, formData]);
                handleSubmitAll();
              }
            }}
          >
            <label style={styles.label}>Car Number:</label>
            <input
              type="text"
              name="carNumber"
              value={formData.carNumber}
              onChange={handleChange}
              required
              style={styles.input}
            />
            <label style={styles.label}>Particulars:</label>
            <input
              type="text"
              name="particulars"
              value={formData.particulars}
              onChange={handleChange}
              required
              style={styles.input}
            />
            <label style={styles.label}>Amount:</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              style={styles.input}
            />
            <label style={styles.label}>Number of Days:</label>
            <input
              type="number"
              name="numberOfDays"
              value={formData.numberOfDays}
              onChange={handleChange}
              required
              style={styles.input}
            />
            <label style={styles.label}>From Date:</label>
            <DatePicker
              selected={formData.fromDate}
              onChange={(date) => handleDateChange("fromDate", date)}
              dateFormat="yyyy-MM-dd"
              placeholderText="Select from date"
              required
              style={styles.input}
            />
            <label style={styles.label}>To Date:</label>
            <DatePicker
              selected={formData.toDate}
              onChange={(date) => handleDateChange("toDate", date)}
              dateFormat="yyyy-MM-dd"
              placeholderText="Select to date"
              required
              style={styles.input}
            />
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <button type="submit" style={styles.button}>
                {currentEntryIndex === totalEntries ? "Submit & Download PDF" : "Next"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "700px",
    margin: "0 auto",
    padding: "30px 20px",
    fontFamily: "Segoe UI, sans-serif",
  },
  header: {
    textAlign: "center",
    marginBottom: "30px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "bold",
    marginBottom: "8px",
  },
  formCard: {
    backgroundColor: "#f9f9f9",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
  },
  sectionTitle: {
    marginBottom: "20px",
    fontSize: "20px",
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: "10px",
    margin: "8px 0 16px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },
  label: {
    fontWeight: "bold",
    display: "block",
    marginTop: "10px",
  },
  button: {
    backgroundColor: "#0070f3",
    color: "#fff",
    border: "none",
    padding: "12px 24px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
    marginTop: "10px",
  },
};
