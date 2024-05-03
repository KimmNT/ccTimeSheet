import React, { useEffect, useState } from "react";
import "../scss/Admin.scss";
import { useLocation, useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaTimes } from "react-icons/fa";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  signOut,
} from "firebase/auth";

export default function Admin() {
  //NAVIGATION
  const [nav, setNav] = useState(0);

  //CREATE USER
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userRole, setUserRole] = useState("");

  //GET USERS LISTS
  const [users, setUsers] = useState([]);

  const { state } = useLocation();
  const userName = state?.userName;

  const navigate = useNavigate();
  const navigateToPage = (pageUrl, stateData) => {
    navigate(pageUrl, { state: stateData });
  };
  //GET USERS
  const getUsers = async () => {
    const data = await getDocs(collection(db, "users"));
    setUsers(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };

  useEffect(() => {
    getUsers();
  }, []);

  //CREATE NEW USER FOR AUTH AND FIRESTORE WITH THE SAME ID
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const res = await createUserWithEmailAndPassword(
        auth,
        userEmail,
        userPassword
      );
      await setDoc(doc(db, "users", res.user.uid), {
        id: res.user.uid,
        username: userEmail,
        password: userPassword,
        role: userRole,
      });
      getUsers();
      setUserEmail("");
      setUserPassword("");
    } catch (err) {
      console.log(err);
    }
  };

  //ALSO DELETE USER AT AUTHENTICATION AND COLLECTION
  const handleDelete = async (userId) => {
    try {
      // Delete user from Firebase Authentication
      await deleteUser(auth.currentUser);

      // Delete user document from Firestore
      await deleteDoc(doc(db, "users", userId));

      // Update local users state after deletion
      setUsers(users.filter((user) => user.id !== userId));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  //HANDLE LOG OUT
  const handleLogOut = () => {
    signOut(auth);
    navigateToPage("/");
  };

  return (
    <div className="admin__container">
      <div className="admin__content">
        <div className="admin__header">
          <div className="admin__header_info">
            <div className="header__thumbnail">Good Morning! {userName}</div>
            <div className="header__back" onClick={handleLogOut}>
              <FaSignOutAlt className="header__back_icon" />
            </div>
          </div>
          <div className="header__nav">
            <div
              onClick={() => setNav(0)}
              className={`nav__item ${nav === 0 ? "active" : "unactive"}`}
            >
              Accounts
            </div>
            <div
              onClick={() => setNav(1)}
              className={`nav__item ${nav === 1 ? "active" : "unactive"}`}
            >
              Check-in
            </div>
            <div
              onClick={() => setNav(2)}
              className={`nav__item ${nav === 2 ? "active" : "unactive"}`}
            >
              Check-out
            </div>
          </div>
        </div>
        <div className="admin__manage">
          <div className="manage__content">
            {nav === 0 ? (
              <div className="manage__item">
                <div className="accounts">
                  <div className="item__input">
                    <div className="item__input_lable">Email</div>
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                    />
                  </div>
                  <div className="item__input">
                    <div className="item__input_lable">Password</div>
                    <input
                      type="text"
                      value={userPassword}
                      onChange={(e) => setUserPassword(e.target.value)}
                    />
                  </div>
                  <div className="item__input role">
                    <div className="item__input_lable">Role</div>
                    <div className="role__option">
                      <div className="role__option_item">
                        <input
                          type="radio"
                          name="role"
                          id="admin"
                          value="admin"
                          checked={userRole === "admin"}
                          onChange={(e) => setUserRole(e.target.value)}
                        />
                        <label htmlFor="admin" className="option__lable">
                          Admin
                        </label>
                      </div>
                      <div className="role__option_item">
                        <input
                          type="radio"
                          name="role"
                          id="user"
                          value="user"
                          checked={userRole === "user"}
                          onChange={(e) => setUserRole(e.target.value)}
                        />
                        <label htmlFor="user" className="option__lable">
                          User
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="item__btn" onClick={handleAddUser}>
                    submit
                  </div>
                </div>
                <div className="manage__users">
                  {users.map((user, index) => (
                    <div key={index} className="user">
                      <div className="user__info">
                        <div className="user__name">{user.username}</div>
                        <div className="user__role">{user.role}</div>
                      </div>
                      <div
                        className="user__delete_btn"
                        onClick={() => handleDelete(user.id)}
                      >
                        <FaTimes className="delete__btn_icon" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : nav === 1 ? (
              <div>check in history</div>
            ) : nav === 2 ? (
              <div>check out history</div>
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
