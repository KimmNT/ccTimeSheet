import React, { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { useLocation, useNavigate } from "react-router-dom";
import "../scss/Home.scss";
import {
  FaLongArrowAltDown,
  FaLongArrowAltUp,
  FaRegThumbsUp,
  FaSignOutAlt,
  FaStar,
} from "react-icons/fa";

export default function Home() {
  const [users, setUsers] = useState([]);
  const [attendanceValue, setAttendanceValue] = useState([]);
  const [checkInValue, setCheckInValue] = useState([]);
  const [checkOutValue, setCheckOutValue] = useState([]);

  const navigate = useNavigate();
  const { state } = useLocation();
  const userId = state?.userId;
  const userName = state?.userName;

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString();
  const formattedTime = currentDate.toLocaleTimeString();

  // Get users from Firestore
  const getUsers = async () => {
    const data = await getDocs(collection(db, "users"));
    setUsers(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };

  // Get attendance status (check-in and check-out data) from Firestore
  const getAttendanceStatus = async () => {
    const checkinRef = collection(db, "checkin");
    const checkoutRef = collection(db, "checkout");

    const checkinQuery = query(
      checkinRef,
      where("date", "==", formattedDate),
      where("userId", "==", userId)
    );

    const checkoutQuery = query(
      checkoutRef,
      where("date", "==", formattedDate),
      where("userId", "==", userId)
    );

    const [checkinSnapshot, checkoutSnapshot] = await Promise.all([
      getDocs(checkinQuery),
      getDocs(checkoutQuery),
    ]);

    const checkinData = checkinSnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
      type: "checkin",
    }));

    const checkoutData = checkoutSnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
      type: "checkout",
    }));

    const attendanceData = [...checkinData, ...checkoutData];
    setAttendanceValue(attendanceData);
    setCheckInValue(checkinData);
    setCheckOutValue(checkoutData);
  };

  useEffect(() => {
    const fetchData = async () => {
      await getUsers();
      await getAttendanceStatus();
    };
    fetchData();
  }, []);

  const navigateToPage = (pageUrl, stateData) => {
    navigate(pageUrl, { state: stateData });
  };

  // Handle check-in
  const handleCheckIn = async () => {
    await addDoc(collection(db, "checkin"), {
      date: formattedDate,
      time: formattedTime,
      userId: userId,
      type: "checkin",
    });
    getAttendanceStatus();
  };

  // Handle check-out
  const handleCheckOut = async () => {
    await addDoc(collection(db, "checkout"), {
      date: formattedDate,
      time: formattedTime,
      userId: userId,
      type: "checkout",
    });
    getAttendanceStatus();
  };

  // Function to calculate time difference between two time strings
  // with an additional parameter to specify extra time
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
      endDate.getTime() - startDate.getTime() + extraTime * 1000 * 60;

    // Convert time difference to hours, minutes, and seconds
    let hours = Math.floor(timeDifference / (1000 * 60 * 60));
    timeDifference %= 1000 * 60 * 60;
    let minutes = Math.floor(timeDifference / (1000 * 60));
    timeDifference %= 1000 * 60;
    let seconds = Math.floor(timeDifference / 1000);

    // Format output
    return `${hours} hours ${minutes} minutes ${seconds} seconds`;
  }

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
        <div className="home__date">
          Today is: <div className="home__date_current">{formattedDate}</div>
        </div>
        {checkOutValue.length > 0 ? (
          <div className="home__end_of_day">
            <div className="like__btn">
              <div className="like__icon">
                <FaStar />
              </div>
            </div>
            <div className="headline">You did a great job today!</div>
            <div className="total">
              Total working time:
              <br />
              {calculateTimeDifference(
                checkInValue[0]?.time,
                checkOutValue[0]?.time,
                30
              )}
            </div>
          </div>
        ) : (
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
        )}
        <div className="home__history">
          <div className="history__item">
            <div className="item__header">
              <div className="item__icon checkin">
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
              <div className="item__number">{checkOutValue[0].time}</div>
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
