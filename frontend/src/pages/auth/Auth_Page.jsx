import React from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Login from "./Login";
const Auth_Page = ({ authType }) => {
  const navigate = useNavigate();
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user === "student") navigate("/studentprofile");
    else if (user === "faculty") navigate("/facultyprofile");
    else if (user === "admin") navigate("/admin");
  }, []);
  return (
    <div>
      <Login authType={authType} />
    </div>
  );
};

export default Auth_Page;
