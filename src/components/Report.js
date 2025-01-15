import React, { useEffect, useState } from "react";
import "../scss/Report.scss";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import {
  FaArrowDown,
  FaArrowLeft,
  FaChartLine,
  FaDownload,
  FaGlasses,
  FaPen,
  FaPlus,
  FaRegClock,
  FaRegUser,
  FaSignOutAlt,
  FaTimes,
  FaYenSign,
} from "react-icons/fa";
import {
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
import { FaMagnifyingGlass } from "react-icons/fa6";

export default function Report() {
  const navigate = useNavigate();
  const navigateToPage = (pageUrl, stateData) => {
    navigate(pageUrl, { state: stateData });
  };

  //REPORT
  const [sortResult, setSortResult] = useState([]);
  const [allWorkingTime, setAllWorkingTime] = useState([]);
  const [totalWorkingTimeByDate, setTotalWorkingTimeByDate] = useState("");
  const [totalIncomeByDate, setTotalIncomeByDate] = useState(0);
  const [isReport, setIsReport] = useState(false);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [userNameArray, setUserNameArray] = useState([]);
  const [userId, setUserId] = useState("");
  const [users, setUsers] = useState([]);
  const [emails, setEmails] = useState([]);
  const [salary, setSalary] = useState([]);
  const [startDate, setStartDate] = useState(new Date());
  const [workingTime, setWorkingTime] = useState([]);
  const [userSalary, setUserSalary] = useState(0);

  useEffect(() => {
    getUsers();
    getWorkingTimeByDate(formatDate(startDate));
    getAllWorkingTime();
  }, [startDate]);
  //FORMAT DATE
  const formatDate = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1; // Months are zero-indexed
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
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
      setUserNameArray(
        usersData.map((user) => ({ id: user.id, userName: user.userName }))
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

  //GET USERS
  const getAllWorkingTime = async () => {
    try {
      const data = await getDocs(collection(db, "workingTime"));
      const usersData = data.docs.map((doc) => {
        const userData = doc.data();
        return {
          id: doc.id,
          ...userData,
        };
      });

      setAllWorkingTime(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
      // Handle error as needed
    }
  };

  const downloadExcel = () => {
    const userInfo = users.find((user) => user.id === userId);

    // Rearrange and rename columns
    const formattedData = sortResult.map(
      ({
        checkIn,
        checkOut,
        date,
        extraTime,
        id,
        totalTime,
        userId,
        userName,
      }) => ({
        Name: userName,
        Date: date,
        "Lock in": checkIn,
        "Lock out": checkOut,
        "Break time": extraTime,
        "Total time": totalTime,
        TotalTimeInHour: convertToHours(totalTime),
        Salary: convertToHours(totalTime) * userSalary,
      })
    );

    const totalWorkingTime = formattedData.reduce(
      (sum, { TotalTimeInHour }) => sum + TotalTimeInHour,
      0
    );
    const totalIncome = totalWorkingTime.toFixed(2) * userSalary;

    // Add a row with total income
    const totalIncomeRow = {
      Name: "Total", // Label the row as "Total Income"
      Date: "", // Leave Date empty for the total row
      "Lock in": "", // Leave "Lock in" empty for the total row
      "Lock out": "", // Leave "Lock out" empty for the total row
      "Break time": "", // Leave "Break time" empty for the total row
      "Total time": convertTimeBack(totalWorkingTime), // Leave "Total time" empty for the total row,
      Salary: totalIncome, // Display total salary in the "Salary" column
    };

    // Append the total income row to the data
    formattedData.push(totalIncomeRow);

    // Convert formatted data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(formattedData);

    // Create and download workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Staff Attendance Data");
    XLSX.writeFile(
      workbook,
      `${
        userInfo.userName
      }-${fromDate.toDateString()}-${toDate.toDateString()}.xlsx`
    );
  };

  const convertToHours = (totalTime) => {
    let hours = 0;
    let minutes = 0;
    let seconds = 0;

    const hoursMatch = totalTime.match(/(\d+)hrs?/);
    const minutesMatch = totalTime.match(/(\d+)mins?/);
    const secondsMatch = totalTime.match(/(\d+)s/);

    if (hoursMatch) hours = parseInt(hoursMatch[1], 10);
    if (minutesMatch) minutes = parseInt(minutesMatch[1], 10);
    if (secondsMatch) seconds = parseInt(secondsMatch[1], 10);

    const timeConvertToNumber = hours + minutes / 60 + seconds / 3600;

    return timeConvertToNumber;
  };
  //CONVERT FROM INT TO STRING WITH WORKINGTIME
  const convertTimeBack = (timeString) => {
    // Split the input by periods
    const [hours, decimalMinutes] = timeString
      .toString()
      .split(".")
      .map(Number);

    // Calculate minutes from the decimal part, handle undefined or missing parts
    const formattedHours = (hours || 0).toFixed(0); // Ensure no decimal places for hours
    const formattedMinutes = decimalMinutes
      ? (
          (decimalMinutes * 60) /
          Math.pow(10, decimalMinutes.toString().length)
        ).toFixed(0)
      : 0;

    // Return formatted time string
    return `${formattedHours}hrs ${formattedMinutes}mins 0s`;
  };

  //REPORT - CALCULATE SALARY ON MONTH
  const getWorkingTimeByUser = (startDate, endDate, userId) => {
    const salaryByUserId = salary.find((salary) => salary.id === userId);
    setUserSalary(salaryByUserId.userSalary);
    const start = new Date(startDate);
    const end = new Date(endDate);

    let totalHours = 0;
    const userAfterSort = [];

    // Convert MM/DD/YYYY date format to Date object
    function parseDate(dateString) {
      const [month, day, year] = dateString.split("/").map(Number);
      return new Date(year, month - 1, day); // month is 0-indexed
    }

    // Filter and sum totalTime for the specified user within the date range
    allWorkingTime.forEach((item) => {
      const itemDate = parseDate(item.date);

      if (item.userId === userId && itemDate >= start && itemDate <= end) {
        const hours = convertToHours(item.totalTime);
        totalHours += hours;

        // Push matching items to userAfterSort array
        userAfterSort.push(item);
      }
    });
    userAfterSort.sort((a, b) => new Date(a.date) - new Date(b.date));
    setSortResult(userAfterSort);
    setTotalWorkingTimeByDate(convertTimeBack(totalHours.toFixed(2)));
    setTotalIncomeByDate(
      parseFloat(totalHours.toFixed(2)) * parseInt(salaryByUserId.userSalary)
    );
  };

  const handleSortReport = () => {
    getWorkingTimeByUser(fromDate, toDate, userId);
    setIsReport(false);
  };

  return (
    <div className="report__cotainer">
      <div className="report__header_container">
        <div className="report__header_content">
          <div className="report__header_nav report__header_item">
            <div className="report__header_button report__back">
              <FaArrowLeft onClick={() => navigateToPage("/admin-manage")} />
            </div>
            Back to Admin
          </div>
          <div
            className="report__header_item "
            onClick={() => setIsReport(true)}
          >
            <div className="report__summary_content">
              {sortResult.length > 0 ? (
                <>
                  <div className="report__summary_item">
                    <div className="summary__item_value">
                      {totalWorkingTimeByDate}
                    </div>
                  </div>
                  <div className="report__summary_item">
                    <div className="summary__item_value">
                      {totalIncomeByDate}¥
                    </div>
                  </div>
                </>
              ) : (
                <></>
              )}
              <div className="report__header_button report__search">
                <FaMagnifyingGlass />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="report__content">
        <div className="report__list">
          {sortResult.map((report, index) => (
            <div className="report__item" key={index}>
              <div className="item__group">
                <div className="item__title">Date</div>
                <div className="item__value">{report.date}</div>
              </div>
              <div className="break"></div>
              <div className="item__group">
                <div className="item__title">Checkin</div>
                <div className="item__value">{report.checkIn}</div>
              </div>
              <div className="break"></div>
              <div className="item__group">
                <div className="item__title">Checkout</div>
                <div className="item__value">{report.checkOut}</div>
              </div>
              <div className="break"></div>
              <div className="item__group">
                <div className="item__title">Break time</div>
                <div className="item__value">{report.extraTime} minutes</div>
              </div>
              <div className="break"></div>
              <div className="item__group">
                <div className="item__title">Total working time</div>
                <div className="item__value">{report.totalTime}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {sortResult.length > 0 ? (
        <div className="report__download" onClick={downloadExcel}>
          <FaArrowDown />
        </div>
      ) : (
        <></>
      )}
      {isReport && (
        <div className="report__filter">
          <div className="report__filter_content">
            <div className="filter__item">
              <div className="filter__title">Staff name</div>
              <div className="filter__list">
                {userNameArray.map((name, index) => (
                  <div
                    className="list__item"
                    key={index}
                    onClick={() => setUserId(name.id)}
                  >
                    <div
                      className={`item__value ${
                        name.id === userId ? `active` : `inactive`
                      }`}
                    >
                      {name.userName}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="filter__item">
              <div className="filter__title">Date</div>
              <div className="filter__list">
                <div className="list__item item__half">
                  <div className="item__title">From date</div>
                  <DatePicker
                    className="filter__date_picker"
                    selected={fromDate}
                    onChange={(date) => setFromDate(date)}
                    dateFormat="M/d/yyyy"
                  />
                </div>
                <div className="list__item item__half">
                  <div className="item__title">To date</div>
                  <DatePicker
                    className="filter__date_picker"
                    selected={toDate}
                    onChange={(date) => setToDate(date)}
                    dateFormat="M/d/yyyy"
                  />
                </div>
              </div>
            </div>
            <div className="filter__btn_container">
              <div
                className="filter__btn close"
                onClick={() => setIsReport(false)}
              >
                close
              </div>
              <div className="filter__btn search" onClick={handleSortReport}>
                search
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
