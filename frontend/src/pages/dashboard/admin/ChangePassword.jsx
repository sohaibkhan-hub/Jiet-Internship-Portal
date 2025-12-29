import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ErrorMessage from "../../../components/ErrorMessage";
import HeaderProfile from "../../../components/HeaderProfile";
import { useAppDispatch } from "../../../hooks/redux";
import { changePasswordAsync } from "../../../store/slices/authSlice";


function ChangePassword() {
  const dispatch = useAppDispatch();
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Handle input changes for all fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});
    if (formData.newPassword !== formData.confirmPassword) {
      setErrors({ general: "New Password and Confirm Password do not match." });
      return;
    }
    try {
      const response = await dispatch(changePasswordAsync({ formData })).unwrap();
      if (response.success === true || response.statusCode === 200) {
        toast.success(response.message || "Password changed successfully!");
        setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setErrors({ general: response.message || "Failed to change password." });
        toast.error(response.message || "Failed to change password.");
      }
    } catch (err) {
      setErrors({ general: err.message || "Failed to change password." });
      toast.error(err.message || "Failed to change password.");
    }
  };

  return (
    <div className="flex bg-gradient-to-br from-gray-100 via-white to-gray-200 min-h-[100vh]">
      <section className="bg-white flex-1 flex flex-col px-0 md:px-0 w-full max-w-7xl mx-auto">
        <HeaderProfile />
        <div className="w-full max-w-7xl mx-auto">
          <div className=" rounded-2xl p-8">
            <h3 className="text-xl font-semibold !text-gray-700 mb-4 border-b pb-2">Change Password</h3>
            <form id="form" onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="oldpassword" className="block text-gray-700 font-semibold mb-1">Old Password</label>
                  <input
                    required
                    type="password"
                    name="oldPassword"
                    id="oldPassword"
                    value={formData.oldPassword}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#EF5350] bg-gray-50"
                    placeholder="Enter Old Password"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="newpassword" className="block text-gray-700 font-semibold mb-1">New Password</label>
                  <input
                    required
                    type="password"
                    name="newPassword"
                    id="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="Enter New Password"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#EF5350] bg-gray-50"
                  />
                </div>
                <div>
                  <label htmlFor="newpasswordC" className="block text-gray-700 font-semibold mb-1">Confirm Password</label>
                  <div className="flex items-center justify-between">
                    <input
                      required
                      type="password"
                      name="confirmPassword"
                      id="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm Password"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#EF5350] bg-gray-50"
                    />
                  </div>
                  {/* No extra message needed, ErrorMessage below handles errors */}
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-4 md:mt-0">
                <ErrorMessage err={errors.general} close={() => setErrors({ general: '' })} />
              </div>
              <div className="flex justify-end mt-6">
                <button
                  type="submit"
                  id="submitButton"
                  className="bg-[#EF5350] text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-600 transition"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ChangePassword;