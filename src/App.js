import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import Home from "./components/Home";

export default function App() {
  // const currentUser = false;

  // const RequireAuth = ({ children }) => {
  //   return currentUser ? children : <Navigate to="/login" />;
  // };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/home"
          element={
            // <RequireAuth>
            <Home />
            // </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
