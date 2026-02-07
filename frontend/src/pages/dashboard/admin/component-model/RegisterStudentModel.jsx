import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MdSave, MdArrowDropDown, MdAdd, MdClose } from "react-icons/md";
import HeaderProfile from "../../../../components/HeaderProfile";
import { useAppDispatch, useAppSelector } from "../../../../hooks/redux";
import {
  getAllBranchesAsync,
  getDomainByBranchIdAsync,
} from "../../../../store/slices/branchDomainSlice";

import { registerStudentAsync } from "../../../../store/slices/adminSlice";
import { toast } from "react-toastify";

function RegisterStudentModel({ onClose, isModal = false }) {
  // Fetch branches from API
  const { allBranches = [] } = useAppSelector(
    (state) => state.domainBranch || {},
  );
  const dispatch = useAppDispatch();
  const branchDomains = useAppSelector((state) => state.domainBranch.domain);
  // State for selected domains (Initialize with user's current domains if available)
  // selectedDomains will store domain IDs
  const [selectedDomains, setSelectedDomains] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // Ref for branch dropdown
  const branchRef = React.useRef(null);
  const dropdownRef = React.useRef(null);

  useEffect(() => {
    dispatch(getAllBranchesAsync());
  }, [dispatch]);

  const [isBranchOpen, setIsBranchOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    rollNumber: "",
    registrationNumber: "",
    fatherName: "",
    dateOfBirth: "",
    phoneNumber: "",
    branchId: "",
    year: "",
    domainsId: selectedDomains,
  });

  // Close branch dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        branchRef.current &&
        !branchRef.current.contains(event.target) &&
        isBranchOpen
      ) {
        setIsBranchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isBranchOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        isDropdownOpen
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Fetch domains for student's branch on mount
  useEffect(() => {
    if (formData.branchId) {
      dispatch(getDomainByBranchIdAsync({ branchId: formData.branchId }));
    }
  }, [dispatch, formData.branchId]);

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

  // Handlers
  const handleRemoveDomain = (domainToRemove) => {
    const updatedDomains = selectedDomains.filter(
      (domainId) => domainId !== domainToRemove,
    );
    setSelectedDomains(updatedDomains);
    setFormData((prev) => ({ ...prev, domainsId: updatedDomains }));
  };

  const handleAddDomain = (domainToAdd) => {
    if (!selectedDomains.includes(domainToAdd._id)) {
      const updatedDomains = [...selectedDomains, domainToAdd._id];
      setSelectedDomains(updatedDomains);
      setFormData((prev) => ({ ...prev, domainsId: updatedDomains }));
    }
    setIsDropdownOpen(false); // Close dropdown after selection
  };

  // Submit handler
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!formData.branchId) {
      toast.error("Please select a branch.");
      return;
    }

    if (selectedDomains.length === 0) {
      toast.error("Please select at least one domain.");
      return;
    }

    try {
      // Ensure domainsId is synced before submit
      const submitData = { ...formData, domainsId: selectedDomains };
      const response = await dispatch(
        registerStudentAsync(submitData),
      ).unwrap();
      if (response.success === true || response.statusCode === 200) {
        toast.success(response.message || "Student registered successfully!");
        setFormData({
          email: "",
          fullName: "",
          rollNumber: "",
          registrationNumber: "",
          fatherName: "",
          dateOfBirth: "",
          phoneNumber: "",
          branchId: "",
          year: "",
          domainsId: [],
        });
        setSelectedDomains([]);
      } else {
        toast.error(response.message || "Failed to register student.");
      }
    } catch (err) {
      toast.error(err.message || "Failed to register student.");
    }
  };

  const formContent = (
    <div className="mt-8 px-0 md:px-8 pb-8">
      {/* Page Title */}
      <h3 className="text-xl font-semibold !text-gray-700 mb-2 border-b pb-2 px-6 md:px-0">
        Register New Student
      </h3>
      <p className="text-sm text-gray-500 mb-6 px-6 md:px-0">
        Enter student details and select branch.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="px-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4 pt-3">
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
                placeholder="e.g. Student Name"
              />
            </div>
            {/* Father's Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Father's Name
              </label>
              <input
                type="text"
                name="fatherName"
                required
                value={formData.fatherName}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#EF5350] bg-gray-50"
                placeholder="e.g. Father Name"
              />
            </div>
            {/* Roll Number */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Roll Number
              </label>
              <input
                type="text"
                name="rollNumber"
                required
                value={formData.rollNumber}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#EF5350] bg-gray-50"
                placeholder="e.g. 567464"
              />
            </div>
            {/* Registration Number */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Registration Number
              </label>
              <input
                type="text"
                name="registrationNumber"
                required
                value={formData.registrationNumber}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#EF5350] bg-gray-50"
                placeholder="e.g. RE7867G123"
              />
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
                inputMode="numeric"
                maxLength={10}
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
            {/* Year */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Year
              </label>
              <input
                type="number"
                name="year"
                required
                value={formData.year}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#EF5350] bg-gray-50"
                placeholder="e.g. 2"
              />
            </div>
            {/* Domain Dropdown */}
            <div className="col-span-1">
              <div className="">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                  {" "}
                  Your Selected Domains{" "}
                </label>

                <div className="min-h-[60px] p-4 bg-gray-50 border border-gray-200 border-dashed rounded-xl flex flex-wrap gap-3">
                  {selectedDomains.length > 0 ? (
                    selectedDomains.map((domainId, index) => {
                      const domainObj = branchDomains.find(
                        (d) => d._id === domainId,
                      );
                      return (
                        <div
                          key={index}
                          className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 border border-red-300 text-xs font-semibold rounded-full shadow-sm"
                        >
                          <span className="text-red-700 border border-red-300 text-xs font-semibold">
                            {domainObj ? domainObj.name : domainId}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveDomain(domainId)}
                            className="hover:text-red-900"
                            title="Remove domain"
                          >
                            <MdClose size={14} />
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <span className="text-gray-400 text-sm italic py-2">
                      No domains selected yet. Please add from the list below.
                    </span>
                  )}
                </div>
              </div>

              <div className="relative pt-4 pb-20" ref={dropdownRef}>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                  {" "}
                  Add New Domain{" "}
                </label>

                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-left text-gray-700 hover:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100 transition-all"
                >
                  <span
                    className={
                      branchDomains.filter(
                        (option) => !selectedDomains.includes(option._id),
                      ).length === 0
                        ? "text-gray-400"
                        : ""
                    }
                  >
                    {branchDomains.filter(
                      (option) => !selectedDomains.includes(option._id),
                    ).length === 0
                      ? "All domains selected"
                      : "Select a domain to add..."}
                  </span>
                  <MdArrowDropDown
                    className={`text-2xl text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen &&
                  branchDomains.filter(
                    (option) => !selectedDomains.includes(option._id),
                  ).length > 0 && (
                    <div className="absolute z-30 mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-100 max-h-40 overflow-y-auto custom-scrollbar">
                      {branchDomains
                        .filter(
                          (option) => !selectedDomains.includes(option._id),
                        )
                        .map((option, idx) => (
                          <button
                            type="button"
                            key={option._id}
                            onClick={() => handleAddDomain(option)}
                            className="w-full text-left px-4 py-2.5 flex items-center justify-between group text-sm border-b border-gray-50 last:border-0 transition-colors hover:bg-red-50 hover:text-red-700 text-gray-700"
                          >
                            {option.name}
                            <MdAdd className="opacity-0 group-hover:opacity-100 text-red-600" />
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
                          type="button"
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
                rollNumber: "",
                registrationNumber: "",
                fatherName: "",
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
            Register Student
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
}
 
export default RegisterStudentModel;
