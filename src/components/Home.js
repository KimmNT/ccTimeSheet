import React, { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword, deleteUser } from "firebase/auth";
import { useLocation, useNavigate } from "react-router-dom";
import "../scss/Home.scss";
import {
  FaLongArrowAltDown,
  FaLongArrowAltUp,
  FaSignOutAlt,
} from "react-icons/fa";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [users, setUsers] = useState([]);
  const [attendaceValue, setAttendanceValue] = useState([]);
  const [checkInValue, setCheckInValue] = useState([]);
  const [checkOutValue, setCheckOutValue] = useState([]);
  const [isCheckIn, setIsCheckIn] = useState(false);

  const navigate = useNavigate();
  const { state } = useLocation();
  const userId = state?.userId;
  const userName = state?.userName;

  const navigateToPage = (pageUrl, stateData) => {
    navigate(pageUrl, { state: stateData });
  };

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString();
  const formattedTime = currentDate.toLocaleTimeString();

  //GET USERS
  const getUsers = async () => {
    const data = await getDocs(collection(db, "users"));
    setUsers(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };

  //CHECKIN STATUS
  const getCheckInStatus = async () => {
    console.log("Get checkin value");
    const checkinRef = collection(db, "checkin");

    const checkinQueryByUser = query(
      checkinRef,
      where("date", "==", formattedDate),
      where("userId", "==", userId)
    );

    //QUERY CHECKIN VALUE
    const checkinStatusQuery = await getDocs(checkinQueryByUser);
    setCheckInValue(
      checkinStatusQuery.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
    );
  };
  //CHECKOUT STATUS
  const getCheckOutStatus = async () => {
    console.log("Get checkin value");
    const checkinRef = collection(db, "checkout");

    const checkOutQuery = query(
      checkinRef,
      where("date", "==", formattedDate),
      where("userId", "==", userId)
    );

    //QUERY CHECKIN VALUE
    const checkoutStatusQuery = await getDocs(checkOutQuery);
    setCheckOutValue(
      checkoutStatusQuery.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
    );
  };

  useEffect(() => {
    getCheckInStatus();
    getCheckOutStatus();
  }, []);

  useEffect(() => {
    getUsers();
  }, [users]);

  //CREATE NEW USER FOR AUTH AND FIRESTORE WITH THE SAME ID
  const handleAddUser = async (e) => {
    e.preventDefault();

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      console.log(res.user.uid);
      await setDoc(doc(db, "users", res.user.uid), {
        username: email,
        password: password,
      });
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

  //HANDLE CHECKIN
  const handleCheckIn = async () => {
    console.log("CHECK-IN COMPLETED");
    await addDoc(collection(db, "checkin"), {
      date: formattedDate,
      time: formattedTime,
      userId: userId,
    });
    getCheckInStatus();
  };

  //HANDLE CHECK-OUT
  const handleCheckOut = async () => {
    console.log("CHECK-OUT COMPLETED");
    await addDoc(collection(db, "checkout"), {
      date: formattedDate,
      time: formattedTime,
      userId: userId,
    });
    getCheckOutStatus();
  };

  return (
    <div className="home__container">
      <div className="home__content">
        <div className="home__header">
          <div className="header__thumbnail">
            Good Morning! <div className="user__name">{userName}</div>
          </div>
          <div className="header__back" onClick={() => navigateToPage("/")}>
            <FaSignOutAlt className="header__back_icon" />
          </div>
        </div>
        {/* <div>
        <input
          type="text"
          placeholder="email@cctimesheet.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="text"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div> */}
        {/* <div onClick={handleAddUser}>CLICK ME!</div>
      <div>-------------------------------</div>
      {users.map((user) => (
        <div key={user.id}>
          <div>{user.username}</div>
          <div>{user.id}</div>
          <div onClick={() => handleDelete(user.id)}>delete this</div>
        </div>
      ))} */}
        <div className="home__date">
          Today is: <div className="home__date_current">{formattedDate}</div>
        </div>
        <div className="home__check_btn">
          {checkInValue.length > 0 ? (
            <>
              <div className="check__btn checkout" onClick={handleCheckOut}>
                <div className="btn__icon checkout">
                  <FaLongArrowAltUp />
                </div>
              </div>
              <div className="btn__text">check-out</div>
            </>
          ) : (
            <>
              <div className="check__btn checkin" onClick={handleCheckIn}>
                <div className="btn__icon checkin">
                  <FaLongArrowAltDown />
                </div>
              </div>
              <div className="btn__text">check-in</div>
            </>
          )}
        </div>
        <div className="home__history">
          <div className="history__item">
            <div className="item__header">
              <div className="item__icon checkout">
                <FaLongArrowAltDown />
              </div>
              <div className="item__name">Check in</div>
            </div>
            {checkInValue.length > 0 ? (
              <>
                {checkInValue.map((item, index) => (
                  <div key={index} className="item__number">
                    {item.time}
                  </div>
                ))}
              </>
            ) : (
              <>
                <div className="item__number">Not available</div>
              </>
            )}
          </div>
          <div className="history__item">
            <div className="item__header">
              <div className="item__icon checkin">
                <FaLongArrowAltUp />
              </div>
              <div className="item__name">Check out</div>
            </div>
            {checkOutValue.length > 0 ? (
              <>
                {checkOutValue.map((item, index) => (
                  <div key={index} className="item__number">
                    {item.time}
                  </div>
                ))}
              </>
            ) : (
              <>
                <div className="item__number">Not available</div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
