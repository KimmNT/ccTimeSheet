import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import {
  // useLocation,
  useNavigate,
} from "react-router-dom";
import "../scss/Login.scss";
import Logo from "./Logo";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const navigate = useNavigate();
  // const { state } = useLocation();

  const navigateToPage = (pageUrl, stateData) => {
    navigate(pageUrl, { state: stateData });
  };

  const handleLogin = (e) => {
    e.preventDefault();

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        navigateToPage("/home", { userId: user.uid, userName: email });
      })
      .catch((error) => {
        setError(true);
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
          {error && <div className="form__error">nahhhh bitcha!</div>}
        </div>
        <div onClick={handleLogin} className="login__btn">
          Sign In
        </div>
      </div>
    </div>
  );
}
