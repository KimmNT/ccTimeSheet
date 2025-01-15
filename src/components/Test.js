import React from "react";
import * as XLSX from "xlsx";

const App = () => {
  // Data array
  const people = [
    { id: 1, name: "Alice", age: 25, gender: "female", role: "user" },
    { id: 2, name: "Bob", age: 30, gender: "male", role: "admin" },
    { id: 3, name: "Charlie", age: 35, gender: "male", role: "user" },
  ];

  // Function to download Excel file
  const downloadExcel = () => {
    // Convert the data array to a worksheet
    const worksheet = XLSX.utils.json_to_sheet(people);

    // Create a new workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "People Data");

    // Write the workbook and trigger download
    XLSX.writeFile(workbook, "PeopleData.xlsx");
  };

  return (
    <div>
      <h1>Download Excel Example</h1>
      <button onClick={downloadExcel}>Download Excel</button>
    </div>
  );
};

export default App;
