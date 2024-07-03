import React, { useState } from "react";

const Test = () => {
  const [items] = useState([
    {
      name: "Item 1",
      createdDate: "2023-07-01",
    },
    {
      name: "Item 2",
      createdDate: "2023-07-02",
    },
    {
      name: "Item 3",
      createdDate: "2023-07-03",
    },
  ]);

  const findItems = (searchTerm, searchType) => {
    return items.filter((item) => {
      if (searchType === "name") {
        return item.name.includes(searchTerm);
      } else if (searchType === "createdDate") {
        return item.createdDate.includes(searchTerm);
      }
      return false;
    });
  };

  return (
    <div>
      <h1>Items</h1>
      <ul>
        {items.map((item, index) => (
          <li key={index}>
            {item.name} - {item.createdDate}
          </li>
        ))}
      </ul>
      <h2>Search Results</h2>
      <h3>Find by Name Contains ("Item"):</h3>
      <ul>
        {findItems("Item", "name").map((item, index) => (
          <li key={index}>
            {item.name} - {item.createdDate}
          </li>
        ))}
      </ul>
      <h3>Find by Created Date Contains ("2023-07"):</h3>
      <ul>
        {findItems("2023-07", "createdDate").map((item, index) => (
          <li key={index}>
            {item.name} - {item.createdDate}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Test;
