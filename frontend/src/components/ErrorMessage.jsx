import React, { Fragment } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";

const ErrorMessage = ({ error, onClear }) => {
  const reduxError = useSelector((state) => state.auth?.error);
  const dispatch = useDispatch();
  const displayError = error || reduxError;

  if (!displayError) return null;

  const errorMsg = typeof displayError === "string" ? displayError : displayError?.message;
  if (!errorMsg) return null;

  // Handler for close button
  const handleClose = () => {
    if (onClear) {
      onClear();
    } else if (!error && reduxError) {
        dispatch({ type: "auth/clearError" });
    }
  };

  return (
    <Fragment>
      <div
        id="err"
        className="bg-red-100 border border-red-400 text-red-700 rounded relative flex items-center justify-between"
        role="alert"
      >
        <span>{errorMsg}</span>
        <button
          type="button"
          aria-label="Close"
          className="ml-4 text-red-700 hover:text-red-900 text-xl font-bold focus:outline-none"
          onClick={handleClose}
        >
          &times;
        </button>
      </div>
    </Fragment>
  );
};

export default ErrorMessage;
