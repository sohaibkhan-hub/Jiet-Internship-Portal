import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MdSave, MdArrowDropDown, MdClose } from "react-icons/md";
import HeaderProfile from "../../../../components/HeaderProfile";
import { useAppDispatch, useAppSelector } from "../../../../hooks/redux";
import { getAllBranchesAsync } from "../../../../store/slices/branchDomainSlice";
import { getAllFacultyDetailsAsync, registerFacultyAsync } from "../../../../store/slices/adminSlice";
import { toast } from "react-toastify";

function RegisterFacultyModel({ onClose, isModal = false, isUpdate = false, initialData = null, onSubmit }) {
  // Dropdown open states (must be declared before useEffect)
  const { allBranches = [] } = useAppSelector(
    (state) => state.domainBranch || {},
  );
  const dispatch = useAppDispatch();
  const [isBranchOpen, setIsBranchOpen] = useState(false);
  const [isDesignationOpen, setIsDesignationOpen] = useState(false);
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    employeeId: "",
    role: "",
    designation: "",
    dateOfBirth: "",
    phoneNumber: "",
    branchId: "",
    isActive: true,
  });
  // Refs for dropdowns
  const branchRef = React.useRef(null);
  const roleRef = React.useRef(null);
  const designationRef = React.useRef(null);
  const statusRef = React.useRef(null);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        branchRef.current &&
        !branchRef.current.contains(event.target) &&
        isBranchOpen
      ) {
        setIsBranchOpen(false);
      }
      if (
        roleRef.current &&
        !roleRef.current.contains(event.target) &&
        isRoleOpen
      ) {
        setIsRoleOpen(false);
      }
      if (
        designationRef.current &&
        !designationRef.current.contains(event.target) &&
        isDesignationOpen
      ) {
        setIsDesignationOpen(false);
      }
      if (
        statusRef.current &&
        !statusRef.current.contains(event.target) &&
        isStatusOpen
      ) {
        setIsStatusOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isBranchOpen, isRoleOpen, isDesignationOpen, isStatusOpen]);

  // Fetch branches from API
  useEffect(() => {
    dispatch(getAllBranchesAsync());
  }, [dispatch]);

  useEffect(() => {
    if (!initialData) return;
    setFormData({
      email: initialData.email || "",
      fullName: initialData.fullName || "",
      employeeId: initialData.employeeId || "",
      role: initialData.role || initialData.user?.role || "",
      designation: initialData.designation || "",
      dateOfBirth: initialData.dateOfBirth || "",
      phoneNumber: initialData.phoneNumber || "",
      branchId: initialData.branch?._id || initialData.branch || "",
      isActive: typeof initialData.isActive === "boolean" ? initialData.isActive : true,
    });
  }, [initialData]);

  // Only one dropdown, so simple toggle
  const handleBranchDropdown = () => {
    setIsBranchOpen((prev) => !prev);
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle branch select (store branchId)
  const handleBranchSelect = (branch) => {
    setFormData((prev) => ({ ...prev, branchId: branch._id }));
    setIsBranchOpen(false);
  };
  const handleStatusDropdown = () => {
    setIsStatusOpen((prev) => !prev);
  };

  // Submit handler
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!formData.branchId) {
      toast.error("Please select a branch.");
      return;
    }

    try {
      if (isUpdate) {
        if (onSubmit) {
          await onSubmit(formData);
        }
        return;
      }

      const response = await dispatch(registerFacultyAsync(formData)).unwrap();

      if (response.success === true || response.statusCode === 200) {
        toast.success(response.message || "Faculty registered successfully!");
        setFormData({
          email: "",
          fullName: "",
          employeeId: "",
          role: "",
          designation: "",
          dateOfBirth: "",
          phoneNumber: "",
          branchId: "",
          isActive: true,
        });
        await dispatch(getAllFacultyDetailsAsync());
        if (onClose) onClose();
      } else {
        toast.error(response.message || "Failed to register faculty.");
      }
    } catch (err) {
      toast.error(err.message || "Failed to register faculty.");
    }
  };

  const formContent = (
    <div className="mt-8 px-0 md:px-8 pb-8">
      {/* Page Title */}
      <h3 className="text-xl font-semibold !text-gray-700 mb-2 border-b pb-2 px-6 md:px-0">
        Register New Faculty
      </h3>
      <p className="text-sm text-gray-500 mb-6 px-6 md:px-0">
        Enter faculty details and select branch.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="px-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4 pt-3">
            {isUpdate && (
              <div ref={statusRef} className="md:col-span-2 relative">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Status
                </label>
                <button
                  type="button"
                  onClick={handleStatusDropdown}
                  className={`w-full flex items-center justify-between px-4 py-2 bg-white border rounded-lg text-sm focus:outline-none transition-colors ${
                    formData.isActive ? "text-green-700 border-green-300" : "text-red-700 border-red-300"
                  } hover:border-red-400`}
                >
                  <span className={`font-bold ${formData.isActive ? "text-green-700" : "text-red-700"}`}>
                    {formData.isActive ? "Active" : "Inactive"}
                  </span>
                  <MdArrowDropDown className="ml-2 text-gray-400" />
                </button>
                {isStatusOpen && (
                  <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                    <button
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-green-50 hover:text-green-700 ${
                        formData.isActive ? "font-bold text-green-700" : ""
                      }`}
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, isActive: true }));
                        setIsStatusOpen(false);
                      }}
                    >
                      Active
                    </button>
                    <button
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-red-50 hover:text-red-700 ${
                        !formData.isActive ? "font-bold text-red-700" : ""
                      }`}
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, isActive: false }));
                        setIsStatusOpen(false);
                      }}
                    >
                      Inactive
                    </button>
                  </div>
                )}
              </div>
            )}
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#EF5350] bg-gray-50"
                placeholder="e.g. student@email.com"
              />
            </div>
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#EF5350] bg-gray-50"
                placeholder="e.g. Faculty Name"
              />
            </div>
            {/* Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                required
                pattern="[0-9]{10}"
                value={formData.phoneNumber}
                onChange={(e) => {
                  const digitsOnly = e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 10);
                  setFormData((prev) => ({ ...prev, phoneNumber: digitsOnly }));
                }}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#EF5350] bg-gray-50"
                placeholder="e.g. 9876543210"
              />
            </div>
            {/* Employee ID */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Employee ID
              </label>
              <input
                type="text"
                name="employeeId"
                required
                value={formData.employeeId}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#EF5350] bg-gray-50"
                placeholder="e.g. 567464"
              />
            </div>
            {/* Role */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Role
              </label>
              <div className="relative" ref={roleRef}>
                <button
                  type="button"
                  onClick={() => setIsRoleOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-500"
                >
                  {formData.role ? formData.role : "Select Role..."}
                  <MdArrowDropDown />
                </button>
                {isRoleOpen && (
                  <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {["TPO", "FACULTY", "ADMIN"].map((role, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, role }));
                          setIsRoleOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 hover:text-red-700 flex justify-between group"
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Date of Birth
              </label>
              <input
                type="date"
                name="dateOfBirth"
                required
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#EF5350] bg-gray-50"
                placeholder="e.g. 2000-01-01"
              />
            </div>
            {/* Designation */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Designation
              </label>
              <div className="relative" ref={designationRef}>
                <button
                  type="button"
                  onClick={() => setIsDesignationOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-500"
                >
                  {formData.designation
                    ? formData.designation
                    : "Select Designation..."}
                  <MdArrowDropDown />
                </button>
                {isDesignationOpen && (
                  <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {[
                      "TPO",
                      "Assistant Professor",
                      "Associate Professor",
                      "Professor",
                      "HOD",
                    ].map((designation, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, designation }));
                          setIsDesignationOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 hover:text-red-700 flex justify-between group"
                      >
                        {designation}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* Branch Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Branch
              </label>
              <div className="relative" ref={branchRef}>
                <button
                  type="button"
                  onClick={handleBranchDropdown}
                  className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-red-400"
                >
                  {formData.branchId
                    ? allBranches.find((b) => b._id === formData.branchId)
                        ?.name || "Select Branch..."
                    : "Select Branch..."}
                  <MdArrowDropDown />
                </button>
                {isBranchOpen && (
                  <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {allBranches.length > 0 ? (
                      allBranches.map((b) => (
                        <button
                          key={b._id}
                          onClick={() => handleBranchSelect(b)}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 hover:text-red-700 flex justify-between group"
                        >
                          {b.name}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-gray-400">
                        No branches found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* ACTIONS */}
        <div className="px-6 py-4 flex justify-end gap-4">
          <Link
            onClick={() =>
              setFormData({
                email: "",
                fullName: "",
                employeeId: "",
                role: "",
                designation: "",
                dateOfBirth: "",
                phoneNumber: "",
                branchId: "",
                year: "",
              })
            }
            className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
          >
            Reset
          </Link>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 shadow-sm hover:shadow-md transition-all flex items-center gap-2"
          >
            <MdSave className="text-lg" />
            {isUpdate ? "Update Faculty" : "Register Faculty"}
          </button>
        </div>
      </form>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 md:p-6 animate-fadeIn">
        <div className="relative w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-fadeIn">
          <button
            type="button"
            className="absolute top-4 right-4 z-10 text-gray-400 hover:text-red-600 text-2xl"
            onClick={onClose}
            aria-label="Close"
          >
            <MdClose />
          </button>
          <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
            {formContent}
          </div>
        </div>
      </div>
    );
  }
  return formContent;
}
 
export default RegisterFacultyModel;
