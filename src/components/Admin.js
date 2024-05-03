import React, { useState } from "react";
import "../scss/Admin.scss";
import { useLocation, useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";

export default function Admin() {
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userRole, setUserRole] = useState("");

  const { state } = useLocation();
  const userId = state?.userId;
  const userName = state?.userName;

  const navigate = useNavigate();
  const navigateToPage = (pageUrl, stateData) => {
    navigate(pageUrl, { state: stateData });
  };
  //GET USERS
  // const getUsers = async () => {
  //   const data = await getDocs(collection(db, "users"));
  //   setUsers(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  // };

  //CREATE NEW USER FOR AUTH AND FIRESTORE WITH THE SAME ID
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const res = await createUserWithEmailAndPassword(
        auth,
        userEmail,
        userPassword
      );
      console.log(res.user.uid);
      await setDoc(doc(db, "users", res.user.uid), {
        username: userEmail,
        password: userPassword,
        role: userRole,
      });
    } catch (err) {
      console.log(err);
    }
  };

  //ALSO DELETE USER AT AUTHENTICATION AND COLLECTION
  // const handleDelete = async (userId) => {
  //   try {
  //     // Delete user from Firebase Authentication
  //     await deleteUser(auth.currentUser);

  //     // Delete user document from Firestore
  //     await deleteDoc(doc(db, "users", userId));

  //     // Update local users state after deletion
  //     setUsers(users.filter((user) => user.id !== userId));
  //   } catch (error) {
  //     console.error("Error deleting user:", error);
  //   }
  // };

  return (
    <div className="admin__container">
      <div className="admin__content">
        <div className="admin__header">
          <div className="header__thumbnail">Good Morning! {userName}</div>
          <div className="header__back" onClick={() => navigateToPage("/")}>
            <FaSignOutAlt className="header__back_icon" />
          </div>
        </div>
        <div className="admin__manage">
          <div className="manage__nav">
            <div className="nav__item accounts">Accounts</div>
            <div className="nav__item checkin">Check-in</div>
            <div className="nav__item checkout">Check-out</div>
          </div>
          <div className="manage__content">
            <div className="manage__item account">
              <div className="item__input">
                <div className="item__input_lable">Email</div>
                <input
                  placeholder="<something>@cctimesheet.com"
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                />
              </div>
              <div className="item__input">
                <div className="item__input_lable">Password</div>
                <input
                  placeholder="email"
                  type="text"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                />
              </div>
              <div className="item__input">
                <div className="item__input_lable">Role</div>
                <div>
                  <div>
                    <label htmlFor="admin" className="item__input_lable">
                      Admin
                    </label>
                    <input
                      placeholder="email"
                      type="radio"
                      name="role"
                      id="admin"
                      value="admin"
                      checked={userRole === "admin"}
                      onChange={(e) => setUserRole(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="user" className="item__input_lable">
                      User
                    </label>
                    <input
                      placeholder="email"
                      type="radio"
                      name="role"
                      id="user"
                      value="user"
                      checked={userRole === "user"}
                      onChange={(e) => setUserRole(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="item__btn" onClick={handleAddUser}>
                submit
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
