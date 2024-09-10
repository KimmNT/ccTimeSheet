import React, { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { useLocation, useNavigate } from "react-router-dom";
import "../scss/Home.scss";
import {
  FaLongArrowAltDown,
  FaLongArrowAltUp,
  FaSignOutAlt,
  FaStar,
} from "react-icons/fa";
import { signOut } from "firebase/auth";

export default function Home() {
  const [users, setUsers] = useState([]);
  const [attendanceValue, setAttendanceValue] = useState([]);
  const [checkInValue, setCheckInValue] = useState("");
  const [checkOutValue, setCheckOutValue] = useState("");
  const [workingTimeId, setWorkingTimeId] = useState("");
  const [isBreakTime, setIsBreakTime] = useState(false);
  const [totalTime, setTotalTime] = useState("");
  const [breakInput, setBreakInput] = useState(0);
  const [err, setErr] = useState("");

  const navigate = useNavigate();
  const navigateToPage = (pageUrl, stateData) => {
    navigate(pageUrl, { state: stateData });
  };
  const { state } = useLocation();
  const userId = state?.userId;
  const userName = state?.userName;

  const currentDate = new Date();
  const currentHour = currentDate.getHours();
  const day = currentDate.getDate();
  const month = currentDate.getMonth() + 1; // Months are zero-indexed
  const year = currentDate.getFullYear();
  const formattedDate = `${month}/${day}/${year}`;
  const options = { hour12: false }; // Use 24-hour format
  const formattedTime = currentDate.toLocaleTimeString(undefined, options);

  // Get users from Firestore
  // const getUsers = async () => {
  //   const data = await getDocs(collection(db, "users"));
  //   setUsers(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  // };

  useEffect(() => {
    const fetchData = async () => {
      await getAttendanceStatus();
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (attendanceValue.length > 0) {
      setCheckInValue(attendanceValue[0].checkIn);
      setCheckOutValue(attendanceValue[0].checkOut);
      setWorkingTimeId(attendanceValue[0].id);
      setTotalTime(attendanceValue[0].totalTime);
    }
  }, [attendanceValue]);

  // useEffect(() => {
  //   if (isBreakTime) {
  //     setBreakTimeValue(
  //       calculateTimeDifference(checkInValue, checkOutValue, breakInput)
  //     );
  //   }
  // }, [isBreakTime]);

  // useEffect(() => {
  //   if (checkInValue && checkOutValue && breakInput !== null) {
  //     setBreakTimeValue(
  //       calculateTimeDifference(checkInValue, checkOutValue, breakInput)
  //     );
  //   }
  // }, [breakInput, checkInValue, checkOutValue, breakTimeValue]);

  // useEffect(() => {
  //   if (breakTimeValue !== "") {
  //     handleCheckOut();
  //   }
  // }, [breakTimeValue]);

  // Get attendance status (check-in and check-out data) from Firestore
  const getAttendanceStatus = async () => {
    const attendacneRef = collection(db, "workingTime");

    const getAttendaceById = query(
      attendacneRef,
      where("date", "==", formattedDate),
      where("userId", "==", userId)
    );

    const attendaceSnapShot = await getDocs(getAttendaceById);

    const attendanceValue = attendaceSnapShot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    setAttendanceValue(attendanceValue);
  };

  // Handle check-in
  const handleCheckIn = async () => {
    await addDoc(collection(db, "workingTime"), {
      date: formattedDate,
      userId: userId,
      userName: userName,
      checkIn: formattedTime,
      checkOut: "",
      totalTime: "",
      extraTime: 0,
    });
    getAttendanceStatus();
  };
  // Handle check-out
  const handleCheckOut = async () => {
    const wrokingTimeRef = doc(db, "workingTime", workingTimeId);
    await updateDoc(wrokingTimeRef, {
      checkOut: formattedTime,
      totalTime: calculateTimeDifference(
        checkInValue,
        formattedTime,
        breakInput
      ),
      extraTime: breakInput,
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

  //HANDLE LOG OUT
  const handleLogOut = () => {
    signOut(auth);
    navigateToPage("/");
  };

  const handleSubmitBreak = () => {
    let checkInDate = new Date(`1970-01-01T${checkInValue}Z`);
    let checkOutDate = new Date(`1970-01-01T${formattedTime}Z`);
    // Calculate the difference in milliseconds
    let differenceInMillis = checkOutDate - checkInDate;
    // Convert the difference into minutes
    let differenceInMinutes = Math.floor(differenceInMillis / 60000);
    if (breakInput < differenceInMinutes) {
      setIsBreakTime(false);
      handleCheckOut();
    } else {
      setErr(`Break time have to greater than ${differenceInMinutes} minutes`);
    }
  };

  return (
    <div className="home__container">
      <div className="home__content">
        <div className="home__header">
          {currentHour > 13 && currentHour < 18 ? (
            <div className="header__thumbnail">
              Good Afternoon! <div className="user__name">{userName}</div>
            </div>
          ) : currentHour > 18 && currentHour < 23 ? (
            <div className="header__thumbnail">
              Good Night! <div className="user__name">{userName}</div>
            </div>
          ) : (
            <div className="header__thumbnail">
              Good Morning! <div className="user__name">{userName}</div>
            </div>
          )}
          <div className="header__back" onClick={handleLogOut}>
            <FaSignOutAlt className="header__back_icon" />
          </div>
        </div>
        <div className="home__date">
          Today is: <div className="home__date_current">{formattedDate}</div>
        </div>
        {checkOutValue !== "" ? (
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
              {totalTime}
            </div>
          </div>
        ) : (
          <div className="home__check_btn">
            {checkInValue !== "" ? (
              <>
                <div
                  className="check__btn checkout"
                  onClick={() => {
                    setIsBreakTime(true);
                    // handleCheckOut();
                  }}
                >
                  <div className="btn__icon checkout">
                    <FaLongArrowAltUp />
                  </div>
                </div>
                <div className="btn__text">Clock-Out now</div>
              </>
            ) : (
              <>
                <div className="check__btn checkin" onClick={handleCheckIn}>
                  <div className="btn__icon checkin">
                    <FaLongArrowAltDown />
                  </div>
                </div>
                <div className="btn__text">Clock-In now</div>
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
              <div className="item__name">Clock-In</div>
            </div>
            {checkInValue !== "" ? (
              <div className="item__number">{checkInValue}</div>
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
              <div className="item__name">Clock-Out</div>
            </div>
            {checkOutValue !== "" ? (
              <div className="item__number">{checkOutValue}</div>
            ) : (
              <>
                <div className="item__number">Not available</div>
              </>
            )}
          </div>
        </div>
      </div>
      {isBreakTime ? (
        <div className="break__container">
          <div className="break__content">
            <div className="break__headline">Are you taking a break today?</div>
            <div className="break__input">
              <input
                type="text"
                value={breakInput}
                onChange={(e) => setBreakInput(e.target.value)}
              />
              <div className="unit">mins</div>
            </div>
            <div className="break__value">{err}</div>
            <div className="break__btn_container">
              <div
                onClick={() => {
                  setIsBreakTime(false);
                  setErr("");
                }}
                className="break__btn close"
              >
                close
              </div>
              <div onClick={handleSubmitBreak} className="break__btn submit">
                submit
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
