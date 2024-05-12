import React, { useEffect } from "react";
import "../scss/Admin.scss";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaLongArrowAltDown,
  FaLongArrowAltUp,
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
  signOut,
} from "firebase/auth";

export default function Test() {
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString();

  //   useEffect(() => {
  //       //Handle submit workingTime
  //       const handleSubmitWorkingTime = async () => {
  //         console.log(breakTimeValue);
  //         await addDoc(collection(db, "workingTime"), {
  //           workingTime: breakTimeValue,
  //           extraTime: breakInput,
  //           userId: userId,
  //           date: formattedDate,
  //         });
  //       };
  //       if (breakTimeValue !== "") {
  //         handleSubmitWorkingTime();
  //       }
  //     }, [breakTimeValue]);
  const wrokingTimeRef = doc(db, "workingTime", "2aqCjaWU8WXLvt3IoKxh");
  const handleSubmitWorkingTime = async () => {
    await updateDoc(wrokingTimeRef, {
      extraTime: 20,
    });
  };
  return (
    <div>
      <div onClick={handleSubmitWorkingTime}>UPDATE</div>
    </div>
  );
}
