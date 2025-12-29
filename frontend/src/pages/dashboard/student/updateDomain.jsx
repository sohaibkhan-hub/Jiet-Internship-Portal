import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  MdDomain, 
  MdClose, 
  MdAdd, 
  MdSave, 
  MdInfo,
  MdArrowDropDown 
} from "react-icons/md";
import Sidenav from "../../../components/Sidenav"; // Adjust path as needed
import HeaderProfile from "../../../components/HeaderProfile"; // Adjust path as needed
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import { getDomainByBranchIdAsync, updateStudentDomainAsync } from "../../../store/slices/branchDomainSlice";
import { toast } from "react-toastify";
import { getCurrentUserAsync } from "../../../store/slices/authSlice";

function UpdateDomain() {
  const { user } = useAppSelector((state) => state.auth);
  const branchDomains = useAppSelector((state) => state.domainBranch.domain);
  const dispatch = useAppDispatch();
  // State for selected domains (Initialize with user's current domains if available)
  const [selectedDomains, setSelectedDomains] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    // Ref for domain dropdown
  const dropdownRef = React.useRef(null);
  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && isDropdownOpen) {
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
    if (user?.profile?.branch?._id) {
      dispatch(getDomainByBranchIdAsync({ branchId: user.profile.branch._id }));
    }
  }, [dispatch, user]);

  // Set initial selected domains if user has them (optional, adjust as needed)
  useEffect(() => {
    if (user?.profile?.internshipData?.preferredDomains) {
      // If preferredDomains is array of objects, map to names; else use as is
      const pd = user.profile.internshipData.preferredDomains;
      if (Array.isArray(pd) && pd.length > 0 && typeof pd[0] === 'object') {
        setSelectedDomains(pd.map(d => d.name));
      } else {
        setSelectedDomains(pd || []);
      }
    }
  }, [user]);

  // Derived state: Get domains that haven't been selected yet
  const availableOptions = Array.isArray(branchDomains)
    ? branchDomains.filter(domainObj => !selectedDomains.includes(domainObj.name))
    : [];

  // Handlers
  const handleRemoveDomain = (domainToRemove) => {
    setSelectedDomains(prev => prev.filter(domain => domain !== domainToRemove));
  };


  const handleAddDomain = (domainToAdd) => {
    setSelectedDomains(prev => [...prev, domainToAdd.name]);
    setIsDropdownOpen(false); // Close dropdown after selection
  };

  const handleSave = async (e) => {
    e.preventDefault();
    // Map selected domain names to their IDs
    const domainIds = Array.isArray(branchDomains)
      ? branchDomains
          .filter(domainObj => selectedDomains.includes(domainObj.name))
          .map(domainObj => domainObj._id)
      : [];
    const result = await dispatch(updateStudentDomainAsync({ domains: domainIds })).unwrap();
    
    if (result.success === true || result.statusCode === 200) {
      await dispatch(getCurrentUserAsync());
      
      toast.success(result.message || 'Domains updated successfully');
    } else {
      toast.error(result.message || 'Failed to update domains');
    }
  };

  return (
    <div className="flex bg-gradient-to-br from-gray-100 via-white to-gray-200 min-h-[calc(100vh-5rem)]">
      {/* Main Content */}
      <section className="w-full max-w-7xl mx-auto px-0 md:px-0">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-12 p-0 md:p-0">
            <HeaderProfile />

            <div className="mt-8 px-0 md:px-8">
                <h3 className="text-xl font-semibold !text-gray-700  border-b pb-2">Update Domains</h3>
                <p className="text-sm text-gray-500 mb-6 px-6 md:px-0">
                    Select your preferred domains.
                </p>

                {/* hide when application is submitted */}

                {user && user.profile && user.profile.internshipData && user.profile.internshipData.isFormSubmitted === false ? (
                  // Main Card
                  <div className="overflow-hidden">
                      <div className="px-6">

                      {/* 1. CURRENTLY SELECTED AREA */}
                      <div className="">
                          <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2"> Your Selected Domains </label>
                          
                          <div className="min-h-[60px] p-4 bg-gray-50 border border-gray-200 border-dashed rounded-xl flex flex-wrap gap-3">
                              {selectedDomains.length > 0 ? (
                                selectedDomains.map((domainName, index) => (
                                  <div 
                                    key={index} 
                                    className="group flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-full shadow-sm hover:border-red-300 transition-all duration-200"
                                  >
                                    <span className="text-gray-700 font-medium text-sm">{domainName}</span>
                                    <button 
                                      onClick={() => handleRemoveDomain(domainName)}
                                      className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-600 transition-colors"
                                      title="Remove domain"
                                    >
                                      <MdClose size={14} />
                                    </button>
                                  </div>
                                ))
                              ) : (
                                <span className="text-gray-400 text-sm italic py-2">
                                  No domains selected yet. Please add from the list below.
                                </span>
                              )}
                          </div>
                      </div>

                      <div className="relative pt-4 pb-20" ref={dropdownRef}>
                          <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2"> Add New Domain </label>

                              <button
                                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                  className="w-full md:w-1/2 flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-left text-gray-700 hover:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100 transition-all"
                              >
                                  <span className={availableOptions.length === 0 ? "text-gray-400" : ""}>
                                  {availableOptions.length === 0 ? "All domains selected" : "Select a domain to add..."}
                                  </span>
                                  <MdArrowDropDown className={`text-2xl text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                              </button>

                              {/* Dropdown Menu */}
                              {isDropdownOpen && availableOptions.length > 0 && (
                                <div className="absolute z-30 mt-2 w-full md:w-1/2 bg-white rounded-lg shadow-xl border border-gray-100 max-h-40 overflow-y-auto custom-scrollbar">
                                  {availableOptions.map((option, idx) => (
                                    <button
                                      key={option._id}
                                      onClick={() => handleAddDomain(option)}
                                      className="w-full text-left px-4 py-2.5 hover:bg-red-50 hover:text-red-700 text-gray-700 text-sm border-b border-gray-50 last:border-0 transition-colors flex items-center justify-between group"
                                    >
                                      {option.name}
                                      <MdAdd className="opacity-0 group-hover:opacity-100 text-red-600" />
                                    </button>
                                  ))}
                                </div>
                              )}
                          </div>
                      </div>


                      {/* Footer Actions */}
                      <div className="px-6 py-4 flex justify-end gap-4">
                      <Link 
                          to="/dashboard" 
                          className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                      >
                          Cancel
                      </Link>
                      <button 
                          onClick={handleSave}
                          className="px-6 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                      >
                          <MdSave className="text-lg" />
                          Save Changes
                      </button>
                      </div>

                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 my-6 px-3 md:px-0">
                    <svg className="w-14 h-14 text-green-400 mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12l2.5 2.5L16 9" />
                    </svg>
                    <div className="text-xl font-semibold text-green-600 mb-1 text-center">Domains Locked</div>
                    <div className="text-gray-500 text-base max-w-lg text-justify md:!text-center mb-2">
                      You have already submitted your internship application.<br/>
                      Your selected domains are now locked and cannot be changed at this stage.
                    </div>
                    <div className="text-gray-400 text-sm max-w-lg text-justify md:!text-center">
                      If you need to update your domains due to a genuine issue, please contact the Training & Placement Office for assistance.
                    </div>
                  </div>
                )}
            </div>
        </div>
      </section>
    </div>
  );
}

export default UpdateDomain;