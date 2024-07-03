import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import Home from "./components/Home";
import Admin from "./components/Admin";
import Test from "./components/Test";

export default function App() {
  // const currentUser = false;

  // const RequireAuth = ({ children }) => {
  //   return currentUser ? children : <Navigate to="/login" />;
  // };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/admin-manage" element={<Admin />} />
        <Route path="/testing" element={<Test />} />
      </Routes>
    </BrowserRouter>
  );
}
