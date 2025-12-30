
import { useDispatch } from "react-redux";
import HeaderProfile from "../../../components/HeaderProfile";
import { useAppSelector } from "../../../hooks/redux";
import { getAllBranchesAsync } from "../../../store/slices/branchDomainSlice";
import { useEffect, useRef, useState } from "react";
import { getStudentDetailsAsync, updateAllocatedCompanyAsync, updateStudentAsync } from "../../../store/slices/adminSlice";
import { MdArrowDropDown, MdSave } from "react-icons/md";
import { toast } from "react-toastify";
import { getAllCompaniesByBranchAsync } from "../../../store/slices/companySlice";

function StudentProfileUpdate() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [formData, setFormData] = useState(null);
  const [companyFormData, setCompanyFormData] = useState(null);
  const [error, setError] = useState("");
  const [isBranchOpen, setIsBranchOpen] = useState(false);
  const [isEditable, setIsEditable] = useState(false);
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);
  const [isAllocationEditable, setIsAllocationEditable] = useState(false);
  const branchRef = useRef(null);
  const companyRef = useRef(null);
  // Handle branch dropdown open/close
  const handleBranchDropdown = () => setIsBranchOpen((prev) => !prev);

  // Handle branch select
  const handleBranchSelect = (branch) => {
    setFormData({
      ...formData,
      branchId: branch._id,
      branch: branch
    });
    setIsBranchOpen(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (branchRef.current && !branchRef.current.contains(event.target)) {
        setIsBranchOpen(false);
      }
    }
    if (isBranchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isBranchOpen]);

  const { allBranches = [] } = useAppSelector((state) => state.domainBranch || {});
  const allCompaniesByBranch = useAppSelector((state) => state.company.allCompaniesByBranch);

  useEffect(() => {
    dispatch(getAllBranchesAsync());
  }, [dispatch]);
  


  useEffect(() => {
    if (isCompanyOpen && formData && formData.branch && formData.branch._id) {
      dispatch(getAllCompaniesByBranchAsync({ branchId: formData.branch._id }));
    }
  }, [isCompanyOpen, formData?.branch?._id, dispatch]);

  // Search student by email
  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      const data = await dispatch(getStudentDetailsAsync(email)).unwrap();
      
      setFormData(data);
    } catch (err) {
      setError("Student not found");
      setFormData(null);
    }
  };

  // Handle form field changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Update student details
  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      // Only send fields shown in the form
      const payload = {
        email: formData.email,
        fullName: formData.fullName,
        fatherName: formData.fatherName,
        dateOfBirth: formData.dateOfBirth,
        phoneNumber: formData.phoneNumber,
        rollNumber: formData.rollNumber,
        registrationNumber: formData.registrationNumber,
        branchId: formData.branchId || formData.branch?._id,
        year: formData.year,
      };
      
      // Only include isFormSubmitted and password if isEditable is true
      if (isEditable) {
        payload.isFormSubmitted = formData.internshipData?.isFormSubmitted ?? false;
        payload.password = formData.password;
      }
      
      // Remove undefined fields
      Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
      
      const response = await dispatch(updateStudentAsync(payload)).unwrap();
          if (response.success === true || response.statusCode === 200) {
              toast.success(response.message || "Student data updated successfully!");
              handleSearch({ preventDefault: () => {} });
              // Clear allCompaniesByBranch after successful allocation
              dispatch({ type: 'company/getAllCompaniesByBranch/fulfilled', payload: null });
            } else {
              toast.error(response.message || "Failed to update student data.");
          }
      } catch (err) {
          toast.error(err.message || "Failed to update student data.");
      }
  };

  // Handle company allocation form submit
  const handleCompanyFormSubmit = async(e) => {
    e.preventDefault();
    const newCompanyId = companyFormData?.companyId;
    const studentId = formData?._id;

    if (!studentId) {
      toast.error("Student ID is missing. Please search for a student first.");
      return;
    }

    if (!newCompanyId) {
      toast.error("Please select a company to allocate.");
      return;
    }

    if(!isAllocationEditable) {
      toast.error("Please enable edit mode to update allocated company.");
      return;
    }

    try {
      const response = await dispatch(updateAllocatedCompanyAsync({ studentId, companyId: newCompanyId })).unwrap();
      if (response.success === true || response.statusCode === 200) {
        toast.success(response.message || "Allocated company updated successfully!");
        handleSearch({ preventDefault: () => {} });
      } else {
        toast.error(response.message || "Failed to update allocated company.");
      }
    } catch (err) {
        toast.error(err.message || "Failed to update allocated company.");
    }
  };

  return (
    <div className="flex bg-gradient-to-br from-gray-100 via-white to-gray-200 min-h-[100vh]">
      <section className="flex-1 flex flex-col px-0 w-full max-w-7xl mx-auto">
        <HeaderProfile />
        {/* Main Content (Profile Details Form) */}
        <div className="w-full max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl px-2 py-8 md:px-8 flex flex-col items-center">
            <h3 className="w-full text-xl font-semibold !text-gray-700 mb-4 border-b pb-2">Update Student Profile</h3>
            
            {/* Search Student details */}
            <form onSubmit={handleSearch} className="mb-6 flex gap-4 w-full max-w-md">
              <input
                type="email"
                placeholder="Enter student email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
                required
              />
              <button type="submit" className="bg-red-600 text-white px-6 py-2 rounded-lg">Search</button>
            </form>
            {error && <div className="text-red-600 mb-2">{error}</div>}

            {/* Update Student Profile */}
            {formData && (
              <form id="form" onSubmit={handleUpdate} className="w-full space-y-8">
                <h3 className="text-xl font-semibold !text-gray-700 mb-4 border-b pb-2">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className="block text-gray-700 font-semibold mb-1">Email</label>
                    <input
                      readOnly
                      type="email"
                      name="email"
                      id="email"
                      disabled
                      className="w-full border bg-gray-50 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF0000] "
                      value={formData.email || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="rollNumber" className="block text-gray-700 font-semibold mb-1">Roll Number</label>
                    <input
                      type="text"
                      name="rollNumber"
                      id="rollNumber"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF0000] "
                      value={formData.rollNumber || ""}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="fullName" className="block text-gray-700 font-semibold mb-1">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      id="fullName"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF0000] "
                      value={formData.fullName || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="fatherName" className="block text-gray-700 font-semibold mb-1">Father's Name</label>
                    <input
                      type="text"
                      name="fatherName"
                      id="fatherName"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF0000] "
                      value={formData.fatherName || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="registrationNumber" className="block text-gray-700 font-semibold mb-1">Registration Number</label>
                    <input
                      type="text"
                      name="registrationNumber"
                      id="registrationNumber"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF0000] "
                      value={formData.registrationNumber || ""}
                      onChange={handleChange}
                    />
                  </div>
                  {/* Branch Dropdown */}
                  <div>
                    <label htmlFor="branchId" className="block text-gray-700 font-semibold mb-1">Branch</label>
                    <div className="relative" ref={branchRef}>
                      <button
                        type="button"
                        onClick={handleBranchDropdown}
                        className="w-full flex items-center justify-between px-4 py-2  border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-red-400"
                      >
                        {(() => {
                          const selectedId = formData.branchId || formData.branch?._id;
                          if (selectedId) {
                            return allBranches.find(b => b._id === selectedId)?.name || formData.branch?.name || "Select Branch...";
                          }
                          return "Select Branch...";
                        })()}
                        <MdArrowDropDown />
                      </button>
                      {isBranchOpen && (
                        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                          {allBranches.length > 0 ? allBranches.map((b) => (
                            <button
                              key={b._id}
                              type="button"
                              onClick={() => handleBranchSelect(b)}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 hover:text-red-700 flex justify-between group"
                            >
                              {b.name}
                            </button>
                          )) : (
                            <div className="px-4 py-2 text-gray-400">No branches found</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="dateOfBirth" className="block text-gray-700 font-semibold mb-1">Date of Birth</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      id="dateOfBirth"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF0000] "
                      value={formData.dateOfBirth || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="phoneNumber" className="block text-gray-700 font-semibold mb-1">Phone Number</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      id="phoneNumber"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF0000] "
                      value={formData.phoneNumber || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="year" className="block text-gray-700 font-semibold mb-1">Year</label>
                    <input
                      type="text"
                      name="year"
                      id="year"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF0000] "
                      value={formData.year || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="role" className="block text-gray-700 font-semibold mb-1">Role</label>
                    <input
                    readOnly
                      type="text"
                      name="role"
                      id="role"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF0000] "
                      value={formData.user.role || ""}
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                </div>
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 mb-2 border border-gray-200 rounded-xl p-3 ${!isEditable ? "bg-gray-50" : ""}`}>
                  <div className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      name="isFormSubmitted"
                      id="isFormSubmitted"
                      checked={!!formData.internshipData.isFormSubmitted}
                      onChange={e => setFormData({ ...formData, internshipData: { ...formData.internshipData, isFormSubmitted: e.target.checked } })}
                      className="mr-2"
                      disabled={!isEditable}
                    />
                    <label htmlFor="isFormSubmitted" className="text-gray-700 font-semibold mb-1">Form Submitted</label>
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-gray-700 font-semibold mb-1">New Password</label>
                    <input
                      type="text"
                      name="password"
                      id="password"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF0000] "
                      value={formData.password || ""}
                      onChange={handleChange}
                      autoComplete="new-password"
                      disabled={!isEditable}
                    />
                  </div>
                </div>
                <div className="items-left flex flex-row justify-end gap-4">
                  <button
                    type="button"
                    className={`px-4 h-10 py-2 rounded-lg font-semibold ${isEditable ? 'bg-gray-400 text-white' : 'bg-blue-600 text-white'}`}
                    onClick={() => setIsEditable((prev) => !prev)}
                  >
                    {isEditable ? 'Lock' : 'Edit'}
                  </button>
                  {/* ACTIONS */}
                    <button
                        type="submit"
                        className="px-6 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 shadow-sm hover:shadow-md transition-all flex items-center text-center gap-2"
                    >
                        <MdSave className="text-lg" />
                        Update Submit
                    </button>
                </div>
              </form>
            )}

            {/* Updated Allocated Company */}
              {formData && (
                <form id="form" onSubmit={handleCompanyFormSubmit} className="w-full space-y-8">

                  <h3 className="w-full text-xl font-semibold !text-gray-700 my-4 border-b pb-2">Update Allocated Company</h3>
                  <div className={`grid grid-cols-1 md:grid-cols-2 mb-2 gap-6 border border-gray-200 rounded-xl p-3 ${!isAllocationEditable ? "bg-gray-50" : ""}`} >
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Current (Old) Company</label>
                      <div className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 text-gray-700">
                        {(() => {
                          if (!formData) return "N/A";
                          const allocatedCompany = formData.internshipData && formData.internshipData.allocatedCompany;
                          if (allocatedCompany) {
                            return allocatedCompany.name || "N/A";
                          }
                        })()}
                      </div>
                    </div>
                    <div>
                      <label htmlFor="companyId" className="block text-gray-700 font-semibold mb-1">Select New Company</label>
                      <div className="relative" ref={companyRef}>
                        <button
                          type="button"
                          disabled={!isAllocationEditable}
                          onClick={() => setIsCompanyOpen(prev => !prev)}
                          className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-red-400"
                        >
                          {(() => {
                            if (!companyFormData) return "Select Company...";
                            const selectedId = companyFormData.companyId || (companyFormData.company && companyFormData.company._id);
                            if (selectedId) {
                              return (allCompaniesByBranch && allCompaniesByBranch.find(c => c._id === selectedId)?.name) || (companyFormData.company && companyFormData.company.name) || "Select Company...";
                            }
                            return "Select Company...";
                          })()}
                          <MdArrowDropDown />
                        </button>
                        {isCompanyOpen && (
                          <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                            {allCompaniesByBranch.length > 0 ? allCompaniesByBranch.map((c) => (
                              <button
                                key={c._id}
                                type="button"
                                onClick={() => {
                                  setCompanyFormData({ ...companyFormData, companyId: c._id });
                                  setIsCompanyOpen(false);
                                }}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 hover:text-red-700 flex justify-between group"
                              >
                                {c.name}
                              </button>
                            )) : (
                              <div className="px-4 py-2 text-gray-400">No companies found</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={`flex flex-row items-left justify-end gap-4 ${!isAllocationEditable ? '' : 'mb-20'}`}>
                    <button
                      type="button"
                      className={`px-4 h-10 py-2 rounded-lg font-semibold ${!isAllocationEditable ? 'bg-blue-600 text-white' : 'bg-gray-400 text-white'}`}
                      onClick={() => setIsAllocationEditable((prev) => !prev)}
                    >
                      {isAllocationEditable ? 'Lock' : 'Edit'}
                    </button>
                    {/* ACTIONS */}
                    {isAllocationEditable && (
                        <button
                          type="submit"
                          className="px-6 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                        >
                          <MdSave className="text-lg" />
                          Update Company
                        </button>
                    )}
                  </div>
                </form>
              )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default StudentProfileUpdate;
