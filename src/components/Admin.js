import React, { useEffect, useState } from "react";
import "../scss/Admin.scss";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaPen,
  FaPenAlt,
  FaPlus,
  FaRegClock,
  FaRegUser,
  FaSignOutAlt,
  FaTimes,
} from "react-icons/fa";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  signOut,
  getAuth,
} from "firebase/auth";

export default function Admin() {
  //SYSTEM
  const [isUserCreated, setIsUserCreated] = useState(false);
  const [error, setError] = useState("");

  //NAVIGATION
  const [nav, setNav] = useState(0);

  //CREATE USER
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userRole, setUserRole] = useState("");

  //GET USERS LIST
  const [users, setUsers] = useState([]);

  //GET WORKING TIME
  const [workingTime, setWorkingTime] = useState([]);
  const [isWorkingTime, setIsWorkingTime] = useState(false);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [extra, setExtra] = useState(0);
  const [total, setTotal] = useState("");
  const [workingTimeId, setWorkingTimeId] = useState("");

  const [searchQuery, setSearchQuery] = useState("");

  const { state } = useLocation();
  const userName = state?.userName;

  const navigate = useNavigate();
  const navigateToPage = (pageUrl, stateData) => {
    navigate(pageUrl, { state: stateData });
  };

  useEffect(() => {
    getUsers();
    getWorkingTime();
  }, []);
  //GET USERS
  const getUsers = async () => {
    const data = await getDocs(collection(db, "users"));
    setUsers(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };
  //GET CHECKIN VALUE
  const getWorkingTime = async () => {
    const data = await getDocs(collection(db, "workingTime"));
    setWorkingTime(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };
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
      setIsUserCreated(false);
      setError("");
    } catch (err) {
      // Handle specific error messages
      if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters");
      } else if (err.code === "auth/email-already-in-use") {
        setError("Email already in use");
      } else {
        setError("An error occurred. Please try again.");
      }
    }
  };

  //UPDATE WORKINGTIME
  const handleEdit = (work) => {
    // console.log(work.id);
    setWorkingTimeId(work.id);
    setCheckIn(work.checkIn);
    setCheckOut(work.checkOut);
    setExtra(work.extraTime);
    setTotal(work.totalTime);
    setIsWorkingTime(true);
  };
  const handleEditWorking = async () => {
    const wrokingTimeRef = doc(db, "workingTime", workingTimeId);
    await updateDoc(wrokingTimeRef, {
      checkIn: checkIn,
      checkOut: checkOut,
      totalTime: calculateTimeDifference(checkIn, checkOut, extra),
      extraTime: extra,
    });
    setIsWorkingTime(false);
    getWorkingTime();
  };

  //ALSO DELETE USER AT AUTHENTICATION AND COLLECTION
  const handleDelete = async (account) => {
    try {
      // Re-authenticate the user
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(
        account.username,
        account.password
      );
      await reauthenticateWithCredential(user, credential);

      // Delete user from Firebase Authentication
      await deleteUser(user);

      // Delete user document from Firestore
      await deleteDoc(doc(db, "users", account.id));

      // Update local users state after deletion
      setUsers(users.filter((user) => user.id !== account.id));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };
  //DELETE WORKINGTIME
  const handleDeleteWorking = async (workID) => {
    try {
      // Delete user document from Firestore
      await deleteDoc(doc(db, "workingTime", workID));
      getWorkingTime();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  //HANDLE LOG OUT
  const handleLogOut = () => {
    signOut(auth);
    navigateToPage("/");
  };

  //HANDLE CREATE
  const handleCreate = () => {
    if (nav === 0) {
      setIsUserCreated(true);
    }
  };

  //HANDLE CLOSE
  const handleClose = () => {
    setIsUserCreated(false);
    setError("");
    setUserEmail("");
    setUserPassword("");
    setIsWorkingTime(false);
  };

  function calculateTimeDifference(startTime, endTime, extraTime = 0) {
    // Check if startTime and endTime are provided and are non-empty strings
    if (
      !startTime ||
      !endTime ||
      typeof startTime !== "string" ||
      typeof endTime !== "string"
    ) {
      return "Invalid input";
    }
    // Split the time strings
    const startParts = startTime.split(":");
    const endParts = endTime.split(":");

    // Check if the split results in valid parts
    if (startParts.length !== 3 || endParts.length !== 3) {
      return "Invalid time format";
    }

    // Parse hours, minutes, and seconds
    const startHours = parseInt(startParts[0], 10);
    const startMinutes = parseInt(startParts[1], 10);
    const startSeconds = parseInt(startParts[2], 10);

    const endHours = parseInt(endParts[0], 10);
    const endMinutes = parseInt(endParts[1], 10);
    const endSeconds = parseInt(endParts[2], 10);

    // Create Date objects
    const startDate = new Date(0, 0, 0, startHours, startMinutes, startSeconds);
    const endDate = new Date(0, 0, 0, endHours, endMinutes, endSeconds);

    // Calculate time difference in milliseconds
    let timeDifference =
      endDate.getTime() - startDate.getTime() - extraTime * 1000 * 60;

    // Convert time difference to hours, minutes, and seconds
    let hours = Math.floor(timeDifference / (1000 * 60 * 60));
    timeDifference %= 1000 * 60 * 60;
    let minutes = Math.floor(timeDifference / (1000 * 60));
    timeDifference %= 1000 * 60;
    let seconds = Math.floor(timeDifference / 1000);

    // Format output
    return `${hours}hrs ${minutes}mins ${seconds}s`;
  }

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
  const filterWork = workingTime.filter((work) =>
    Object.values(work).some((value) =>
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  const filterUser = users.filter((user) =>
    Object.values(user).some((value) =>
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="admin__container">
      <div className="admin__content">
        <div className="admin__header">
          <div className="admin__header_info">
            <div className="header__thumbnail">Welcome back!</div>
            <div className="header__back" onClick={handleLogOut}>
              <FaSignOutAlt className="header__back_icon" />
            </div>
          </div>
          <div className="admin__header_nav">
            <div className="nav__item">
              <div
                onClick={() => setNav(0)}
                className={`nav ${nav === 0 ? "active" : "unactive"}`}
              >
                <FaRegUser />
              </div>
              <div
                onClick={() => setNav(1)}
                className={`nav ${nav === 1 ? "active" : "unactive"}`}
              >
                <div className="btn__icon checkout">
                  <FaRegClock />
                </div>
              </div>
            </div>
            {nav === 0 ? (
              <div className="nav__item">
                <FaPlus className="icon" onClick={handleCreate} />
              </div>
            ) : (
              <></>
            )}
          </div>
          <div className="search">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <FaTimes className="clear" onClick={() => setSearchQuery("")} />
          </div>
        </div>
        <div className="admin__manage">
          <div className="manage__content">
            {nav === 0 ? (
              <div className="manage__item ">
                <div className="item__users">
                  {filterUser.map((user, index) => (
                    <div key={index} className="user">
                      <div className="user__info">
                        <div className="user__name">{user.username}</div>
                        <div className="user__name">{user.password}</div>
                        <div className="user__role">
                          <div className="text">{user.role}</div>
                        </div>
                      </div>
                      <div
                        className="user__delete_btn"
                        onClick={() => handleDelete(user)}
                      >
                        <FaTimes className="delete__btn_icon" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="manage__item ">
                <div className="item__work">
                  {filterWork.map((work, index) => (
                    <div key={index} className="work">
                      <div className="work__user">{work.userName}</div>
                      <div className="work__info">
                        <div className="item">
                          <div className="title">Date</div>
                          <div className="number">{work.date}</div>
                        </div>
                      </div>
                      <div className="work__info">
                        <div className="item">
                          <div className="title">Check In</div>
                          <div className="number">{work.checkIn}</div>
                        </div>
                        <div className="item">
                          <div className="title">Check Out</div>
                          <div className="number">{work.checkOut}</div>
                        </div>
                      </div>
                      <div className="work__info">
                        <div className="item">
                          <div className="title">Extra</div>
                          <div className="number">{work.extraTime} minutes</div>
                        </div>
                        <div className="item">
                          <div className="title">Total</div>
                          <div className="number fixed">{work.totalTime}</div>
                        </div>
                      </div>
                      <div className="work__controller">
                        <div
                          className="control__item edit"
                          onClick={() => handleEdit(work)}
                        >
                          <FaPen />
                        </div>
                        <div
                          className="control__item delete"
                          onClick={() => handleDeleteWorking(work.id)}
                        >
                          <FaTimes />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {isUserCreated ? (
        <div className="alert">
          <div className="alert__content">
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
            {error && <div className="error-message">{error}</div>}
            <div className="btns__container">
              <div className="item__btn" onClick={handleClose}>
                <div className="text close">cancel</div>
              </div>
              <div className="item__btn" onClick={handleAddUser}>
                <div className="text create">submit</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
      {isWorkingTime ? (
        <div className="alert">
          <div className="alert__content">
            <div className="item__input">
              <div className="item__input_lable">Check In</div>
              <input
                type="check in"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
              />
            </div>
            <div className="item__input">
              <div className="item__input_lable">Check Out</div>
              <input
                type="check out"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </div>
            <div className="item__input">
              <div className="item__input_lable">Extra</div>
              <input
                type="extra"
                value={extra}
                onChange={(e) => setExtra(e.target.value)}
              />
            </div>
            <div className="btns__container">
              <div className="item__btn" onClick={handleClose}>
                <div className="text close">cancel</div>
              </div>
              <div className="item__btn" onClick={handleEditWorking}>
                <div className="text create">edit</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
