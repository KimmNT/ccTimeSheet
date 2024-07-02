import React, { useEffect, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import {
  // useLocation,
  useNavigate,
} from "react-router-dom";
import "../scss/Login.scss";
import Logo from "./Logo";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [accountInfo, setAccountInfo] = useState("");

  const navigate = useNavigate();
  // const { state } = useLocation();

  const navigateToPage = (pageUrl, stateData) => {
    navigate(pageUrl, { state: stateData });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const userRef = collection(db, "users");
    const roleQuery = query(
      userRef,
      where("userEmail", "==", email),
      where("userPassword", "==", password)
    );
    const querySnapshot = await getDocs(roleQuery);
    // Handle querySnapshot data here
    querySnapshot.forEach((doc) => {
      doc.data().role === "admin"
        ? navigateToPage("/admin-manage", {
            userId: doc.data().id,
            userName: doc.data().userName,
          })
        : navigateToPage("/home", {
            userId: doc.data().id,
            userName: doc.data().userName,
          });
    });
  };

  return (
    <div className="login__container">
      <div className="login__content">
        <div className="login__logo">
          <Logo />
        </div>
        <div className="login__header">Sign In</div>
        <div className="login__form">
          <div className="form__item">
            <div className="form__item_headline">Email</div>
            <input
              placeholder="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form__item">
            <div className="form__item_headline">Password</div>
            <input
              placeholder="name"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && (
            <div className="form__error">
              Wrong email or password.
              <br /> Please try again!
            </div>
          )}
        </div>
        <div onClick={handleLogin} className="login__btn">
          Sign In
        </div>
      </div>
    </div>
  );
}
