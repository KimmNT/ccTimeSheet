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
  FaYenSign,
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
import { db } from "../firebase";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function Admin() {
  //SYSTEM
  const [isUserCreated, setIsUserCreated] = useState(false);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");

  //NAVIGATION
  const [nav, setNav] = useState(0);

  //CREATE USER
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userRole, setUserRole] = useState("");
  const [userName, setUserName] = useState("");
  const [userContact, setUserContact] = useState("");
  const [userBank, setUserBank] = useState("");
  const [userSalary, setUserSalary] = useState(0);
  const [editUser, setEditUser] = useState(false);
  const [userId, setUserId] = useState("");

  //GET USERS LIST
  const [users, setUsers] = useState([]);
  const [emails, setEmails] = useState([]);
  const [salary, setSalary] = useState([]);

  //GET WORKING TIME
  const [workingTime, setWorkingTime] = useState([]);
  const [isWorkingTime, setIsWorkingTime] = useState(false);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [extra, setExtra] = useState(0);
  const [total, setTotal] = useState("");
  const [workingTimeId, setWorkingTimeId] = useState("");

  //PAYMENT
  const [isPayment, setIsPayment] = useState(false);
  const [transportFree, setTransportFree] = useState(false);
  const [payment, setPayment] = useState(0);
  const [payDate, setPayDate] = useState("");

  const { state } = useLocation();

  const navigate = useNavigate();
  const navigateToPage = (pageUrl, stateData) => {
    navigate(pageUrl, { state: stateData });
  };

  useEffect(() => {
    getUsers();
    getWorkingTimeByDate(formatDate(startDate));
  }, [startDate]);
  //AUTO GENERATE STRING AS ID
  const generateRandomString = (length) => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let result = "";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };
  //GET USERS
  const getUsers = async () => {
    try {
      const data = await getDocs(collection(db, "users"));
      const usersData = data.docs.map((doc) => {
        const userData = doc.data();
        return {
          id: doc.id,
          ...userData,
          // Adjust this line according to your document structure
          userEmail: userData.userEmail, // Assuming userEmail is a top-level field
        };
      });

      setUsers(usersData);
      setEmails(
        usersData.map((user) => ({ id: user.id, userEmail: user.userEmail }))
      );
      setSalary(
        usersData.map((user) => ({ id: user.id, userSalary: user.userSalary }))
      );
    } catch (error) {
      console.error("Error fetching users:", error);
      // Handle error as needed
    }
  };
  //GET CHECKIN VALUE
  const getWorkingTimeByDate = async (date) => {
    const workingTimeRef = collection(db, "workingTime");

    const getWorkingTimeByDate = query(
      workingTimeRef,
      where("date", "==", date)
    );

    const workingTimeSnapShot = await getDocs(getWorkingTimeByDate);

    const workingTimeValue = workingTimeSnapShot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    setWorkingTime(workingTimeValue);
  };
  //CREATE NEW USER FOR AUTH AND FIRESTORE WITH THE SAME ID
  const handleAddUser = async (e) => {
    e.preventDefault();
    if (emails.some((email) => email.userEmail === userEmail)) {
      setError("Email already in use");
    } else {
      try {
        // Generate a unique user ID using Firestore's auto-generated ID
        const userId = generateRandomString(20);

        // Store user data in Firestore
        await setDoc(doc(db, "users", userId), {
          id: userId,
          userEmail: userEmail,
          userPassword: userPassword,
          userName: userName,
          userContact: userContact,
          userBank: userBank,
          userSalary: userSalary,
          role: userRole,
        });

        // Clear form fields and state after successful creation
        getUsers(); // Assuming getUsers fetches updated user list
        setUserEmail("");
        setUserPassword("");
        setUserName("");
        setUserContact("");
        setUserBank("");
        setUserSalary("");
        setIsUserCreated(false); // Assuming you want to indicate successful creation
        setError(""); // Clear any previous errors
      } catch (err) {
        // Handle any errors
        setError("An error occurred. Please try again.");
        console.error("Error adding user: ", err);
      }
    }
  };
  //UPDATE USER
  const handleEditUser = (account) => {
    setUserId(account.id);
    setUserEmail(account.userEmail);
    setUserPassword(account.userPassword);
    setUserName(account.userName);
    setUserContact(account.userContact);
    setUserBank(account.userBank);
    setUserSalary(account.userSalary);
    setUserRole(account.role);
    setIsUserCreated(true);
    setEditUser(true);
  };
  const handleUpdateUserInfo = async () => {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      userEmail: userEmail,
      userPassword: userPassword,
      userName: userName,
      userContact: userContact,
      userBank: userBank,
      userSalary: userSalary,
      role: userRole,
    });
    setIsUserCreated(false);
    getUsers();
  };
  //UPDATE WORKINGTIME
  const handleEdit = (work) => {
    console.log(work.id);
    setWorkingTimeId(work.id);
    setCheckIn(work.checkIn);
    setCheckOut(work.checkOut);
    setExtra(work.extraTime);
    setTotal(work.totalTime);
    setUserName(work.userName);
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
    getWorkingTimeByDate(formatDate(startDate));
  };
  //ALSO DELETE USER AT AUTHENTICATION AND COLLECTION
  const handleDelete = async (account) => {
    try {
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
      getWorkingTimeByDate(formatDate(startDate));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };
  //HANDLE LOG OUT
  const handleLogOut = () => {
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
    setUserName("");
    setUserContact("");
    setUserBank("");
    setUserSalary("");
    setIsWorkingTime(false);
  };
  //HANDLE PAYMENT
  const handlePayMent = (work) => {
    const salaryById = salary.find((salary) => salary.id === work.userId);
    setUserSalary(salaryById.userSalary);
    setUserName(work.userName);
    setTotal(convertToHours(work.totalTime));
    setPayDate(work.date);
    setCheckIn(work.checkIn);
    setCheckOut(work.checkOut);
    setIsPayment(true);
    // console.log(work);
  };
  const handleCalculatePayment = () => {
    if (transportFree) {
      setPayment(userSalary * total - 1000);
    } else {
      setPayment(userSalary * total);
    }
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
  const convertToHours = (timeStr) => {
    const hoursMatch = timeStr.match(/(\d+)\s*hrs/);
    const minsMatch = timeStr.match(/(\d+)\s*mins/);
    const secsMatch = timeStr.match(/(\d+)\s*s/);

    const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
    const minutes = minsMatch ? parseInt(minsMatch[1], 10) : 0;
    const seconds = secsMatch ? parseInt(secsMatch[1], 10) : 0;

    const totalHours = hours + minutes / 60 + seconds / 3600;
    return totalHours.toFixed(2);
  };
  const formatDate = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1; // Months are zero-indexed
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };
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

  const handleCheckboxChange = (e) => {
    setTransportFree(e.target.checked);
  };

  return (
    <div className="admin__container">
      <div className="admin__content">
        <div className="admin__header">
          <div className="admin__header_info">
            <div className="header__thumbnail">
              Welcome back! {selectedDate}
            </div>
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
          </div>
          <div className="control__container">
            <div className="search">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <FaTimes className="clear" onClick={() => setSearchQuery("")} />
            </div>
            {nav === 0 ? (
              <div className="nav__item">
                <FaPlus className="icon" onClick={handleCreate} />
              </div>
            ) : (
              <div className="date__container">
                Day:
                <DatePicker
                  className="date__picker"
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  dateFormat="M/d/yyyy"
                />
              </div>
            )}
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
                        <div className="user__name">
                          Email: {user.userEmail}
                        </div>
                        <div className="user__name">
                          Password: {user.userPassword}
                        </div>
                        <div className="user__role">
                          <div className="text">{user.role}</div>
                        </div>
                      </div>
                      <div className="user__btns">
                        <div
                          className="user__btn edit"
                          onClick={() => handleEditUser(user)}
                        >
                          <FaPen className="delete__btn_icon" />
                        </div>
                        <div
                          className="user__btn delete"
                          onClick={() => handleDelete(user)}
                        >
                          <FaTimes className="delete__btn_icon" />
                        </div>
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
                          <div className="title">Break time</div>
                          <div className="number">{work.extraTime} minutes</div>
                        </div>
                        <div className="item">
                          <div className="title">Total</div>
                          <div className="number fixed">{work.totalTime}</div>
                        </div>
                      </div>
                      <div className="work__controller">
                        {work.checkOut !== "" ? (
                          <div
                            className="pay"
                            onClick={() => handlePayMent(work)}
                          >
                            <FaYenSign />
                          </div>
                        ) : (
                          <div></div>
                        )}
                        <div className="control__item_container">
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
            <div className="item__group">
              <div className="item__input">
                <div className="item__input_lable">Name</div>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>
              <div className="item__input">
                <div className="item__input_lable">Contact</div>
                <input
                  type="text"
                  value={userContact}
                  onChange={(e) => setUserContact(e.target.value)}
                />
              </div>
            </div>
            <div className="item__group">
              <div className="item__input">
                <div className="item__input_lable">Bank account</div>
                <input
                  type="text"
                  value={userBank}
                  onChange={(e) => setUserBank(e.target.value)}
                />
              </div>
              <div className="item__input">
                <div className="item__input_lable">Salary (¥/h)</div>
                <input
                  type="text"
                  value={userSalary}
                  onChange={(e) => setUserSalary(e.target.value)}
                />
              </div>
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
              {editUser ? (
                <div className="item__btn" onClick={handleUpdateUserInfo}>
                  <div className="text create">edit</div>
                </div>
              ) : (
                <div className="item__btn" onClick={handleAddUser}>
                  <div className="text create">create</div>
                </div>
              )}
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
              <div className="item__input_lable">Break time (minutes)</div>
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
      {isPayment ? (
        <div className="alert">
          <div className="salary">
            <div className="salary__item">
              <div className="title">Date</div>
              <div className="value">{payDate}</div>
            </div>
            <div className="salary__item">
              <div className="title">Name</div>
              <div className="value">{userName}</div>
            </div>
            <div className="salary__item">
              <div className="title">Salary</div>
              <div className="value">{userSalary}¥/h</div>
            </div>
            <div className="salary__item">
              <div className="title">Total</div>
              <div className="value">
                <div className="value__total">{total} hours</div>
                <div className="value__range">
                  {checkIn} - {checkOut}
                </div>
              </div>
            </div>
            <div className="salary__item">
              <div className="title">Transport</div>
              <input
                type="checkbox"
                checked={transportFree}
                onChange={handleCheckboxChange}
              />
            </div>
            <div className="line"></div>
            <div className="salary__result_container">
              <div className="result__btns">
                <div className="btn pay" onClick={handleCalculatePayment}>
                  pay
                </div>
                <div
                  className="btn cancel"
                  onClick={() => {
                    setIsPayment(false);
                    setPayment(0);
                  }}
                >
                  cancel
                </div>
              </div>
              <div className="result__content">{payment}¥</div>
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
