import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { 
  MdBusiness, 
  MdLocationOn, 
  MdDelete, 
  MdSave, 
  MdAddCircle, 
  MdDomain,
  MdArrowDropDown,
  MdWarning,
  MdLowPriority
} from "react-icons/md";
import HeaderProfile from "../../../components/HeaderProfile"; 
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import { getDomainCompaniesAsync, submitInternshipApplicationAsync } from "../../../store/slices/studentSlice";
import { toast } from "react-toastify";
import { getCurrentUserAsync } from "../../../store/slices/authSlice";

function ApplyCompany() {

  // Refs for dropdowns
  const domainDropdownRef = useRef(null);
  const companyDropdownRef = useRef(null);
  const locationDropdownRef = useRef(null);
  const domainCompanies = useAppSelector((state) => state.student.domainCompanies || []);
  const dispatch = useAppDispatch();
  // Use correct path for profile (state.auth.profile)
  const profile = useAppSelector((state) => state.auth.user.profile || {});

  // Student's preferred domains from profile
  const preferredDomains = (profile && profile.internshipData.preferredDomains) ? profile.internshipData.preferredDomains : [];

  // State: The list of 4 choices the user is building
  const [choices, setChoices] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false); 
  // State: The current form selection (temporary before adding)
  const [currentSelection, setCurrentSelection] = useState({
    domain: null, // will be domain object
    company: null, // will be company object
    location: "",
    domainDropdownOpen: false,
    companyDropdownOpen: false,
    locationDropdownOpen: false
  });

  const [error, setError] = useState("");

  // --- HANDLERS ---
  // --- OUTSIDE CLICK HANDLER ---
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        domainDropdownRef.current &&
        !domainDropdownRef.current.contains(event.target) &&
        currentSelection.domainDropdownOpen
      ) {
        setCurrentSelection(prev => ({ ...prev, domainDropdownOpen: false }));
      }
      if (
        companyDropdownRef.current &&
        !companyDropdownRef.current.contains(event.target) &&
        currentSelection.companyDropdownOpen
      ) {
        setCurrentSelection(prev => ({ ...prev, companyDropdownOpen: false }));
      }
      if (
        locationDropdownRef.current &&
        !locationDropdownRef.current.contains(event.target) &&
        currentSelection.locationDropdownOpen
      ) {
        setCurrentSelection(prev => ({ ...prev, locationDropdownOpen: false }));
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [currentSelection.domainDropdownOpen, currentSelection.companyDropdownOpen, currentSelection.locationDropdownOpen]);

  // 1. Handle Domain Change (Reset Company & Location)
  const handleDomainChange = async (domainObj) => {
    setCurrentSelection({
      domain: domainObj,
      company: null,
      location: "",
      domainDropdownOpen: false,
      companyDropdownOpen: false,
      locationDropdownOpen: false
    });
    setError("");
    if (domainObj && domainObj._id) {
      await dispatch(getDomainCompaniesAsync(domainObj._id));
    }
  };

  // 2. Handle Company Change (Reset Location)
  const handleCompanyChange = (companyObj) => {
    setCurrentSelection(prev => ({
      ...prev,
      company: companyObj,
      location: "",
      companyDropdownOpen: false,
      locationDropdownOpen: false
    }));
  };

  // 3. Handle Location Change
  const handleLocationChange = (location) => {
    setCurrentSelection(prev => ({
      ...prev,
      location,
      locationDropdownOpen: false
    }));
  };

  // 4. Add Choice to List
  const handleAddChoice = () => {
    // Validation
    if (!currentSelection.domain || !currentSelection.company || !currentSelection.location) {
      setError("Please select all fields (Domain, Company, and Location).");
      return;
    }

    if (choices.length >= 4) {
      setError("You can only select up to 4 priorities.");
      return;
    }

    // Check for duplicates
    const isDuplicate = choices.some(
      c => c.company && currentSelection.company && c.company._id === currentSelection.company._id && c.location === currentSelection.location
    );
    if (isDuplicate) {
      setError("You have already selected this company and location.");
      return;
    }

    // Add to list
    const newChoice = {
      id: Date.now(), // simple ID
      priority: choices.length + 1,
      domain: currentSelection.domain,
      company: currentSelection.company,
      location: currentSelection.location
    };

    setChoices([...choices, newChoice]);
    // Reset Form and dropdown states
    setCurrentSelection({
      domain: null,
      company: null,
      location: "",
      domainDropdownOpen: false,
      companyDropdownOpen: false,
      locationDropdownOpen: false
    });
    setError("");
  };

  // 5. Remove Choice
  const handleRemoveChoice = (id) => {
    const newChoices = choices.filter(c => c.id !== id);
    // Re-assign priorities based on new order
    const reordered = newChoices.map((c, idx) => ({ ...c, priority: idx + 1 }));
    setChoices(reordered);
    setError("");
  };

  const handleSave = async() => {
    if (choices.length === 0) {
      toast.error("Please fill all four choices before submitting.");
      return;
    }
    // Map choices to only required fields
    const submission = choices.map((item) => ({
      domainId: item.domain && item.domain._id ? item.domain._id : null,
      companyId: item.company && item.company._id ? item.company._id : null,
      location: item.location,
      priority: item.priority
    }));

    try {
      const response = await dispatch(submitInternshipApplicationAsync({choices:submission})).unwrap();
      if (response.success === true || response.statusCode === 200) {
        await dispatch(getCurrentUserAsync());
        toast.success(response.message || "Choices submitted successfully!");
      } else {
        toast.error(response.message || "Failed to submit choices.");
      }
    } catch (error) {
      const message = error?.message || "Submission failed.";
      toast.error(message);
    }
  };

  // --- DERIVED DATA Helpers ---
  // Get companies based on selected domain (from API)
  const availableCompanies = Array.isArray(domainCompanies)
    ? domainCompanies
    : [];

  // Get locations based on selected company (from API)
  let availableLocations = [];
  if (currentSelection.company && currentSelection.company.location) {
    const loc = currentSelection.company.location;
    if (typeof loc === 'object' && loc !== null && 'city' in loc) {
      // If location is an object with a city property, show only city
      availableLocations = [loc.city];
    } else if (Array.isArray(loc)) {
      // If location is an array, show as is (fallback)
      availableLocations = loc;
    } else if (typeof loc === 'string') {
      availableLocations = [loc];
    }
  }

  return (
    <div className="flex bg-gradient-to-br from-gray-100 via-white to-gray-200 min-h-[calc(100vh-5rem)]">
      {/* Main Content */}
      <section className="w-full max-w-7xl mx-auto px-0 md:px-0">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-12 p-0 md:p-0">
            {/* Header Profile - Kept Exact */}
            <HeaderProfile />
            <div className="mt-8 px-0 md:px-8 pb-8">
                <h3 className="text-xl font-semibold !text-gray-700 mb-2 border-b pb-2 px-6 md:px-0">
                    Company Preferences
                </h3>
                <p className="text-sm text-gray-500 mb-6 px-6 md:px-0">
                    Select your preferred companies based on your chosen domains. You can add up to 4 priorities.
                </p>
                {/* Header for Add New Preferences */}
                {profile && profile.internshipData && profile.internshipData.isFormSubmitted === false ? (
                  <div className="">
                      {/* --- ADD NEW CHOICE FORM --- */}
                      <div className="px-4 mb-8">
                          <div className="flex items-center gap-3">
                              <div className="p-2 bg-red-50 rounded-lg">
                                  <MdAddCircle className="text-red-600 w-5 h-5" />
                              </div>
                              <span className="text-lg font-bold text-gray-800">Add New Preferences</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 pt-4">
                            {/* 1. Domain Dropdown */}
                              <div className="relative" ref={domainDropdownRef}>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">Step 1: Domain</label>
                              <button
                                type="button"
                                className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-left text-gray-700 hover:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100 transition-all"
                                onClick={() => setCurrentSelection(prev => ({
                                  ...prev,
                                  domainDropdownOpen: !prev.domainDropdownOpen,
                                  companyDropdownOpen: false,
                                  locationDropdownOpen: false
                                }))}
                                disabled={choices.length >= 4}
                              >
                                <span className={preferredDomains.length === 0 ? "text-gray-400" : ""}>
                                  {currentSelection.domain ? currentSelection.domain.name : (preferredDomains.length === 0 ? "All domains selected" : "Select a domain...")}
                                </span>
                                <MdArrowDropDown className={`text-2xl text-gray-400 transition-transform ${currentSelection.domainDropdownOpen ? 'rotate-180' : ''}`} />
                              </button>
                              {currentSelection.domainDropdownOpen && preferredDomains.length > 0 && (
                                <div className="absolute z-30 mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-100 max-h-40 overflow-y-auto custom-scrollbar">
                                  {preferredDomains.map((option, idx) => (
                                    <button
                                      key={option._id}
                                      type="button"
                                      onClick={() => handleDomainChange(option)}
                                      className="w-full text-left px-4 py-2.5 hover:bg-red-50 hover:text-red-700 text-gray-700 text-sm border-b border-gray-50 last:border-0 transition-colors flex items-center justify-between group"
                                      style={{
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        maxWidth: '100%',
                                        wordBreak: 'break-all',
                                      }}
                                      title={option.name}
                                    >
                                      <span style={{
                                        display: 'inline-block',
                                        maxWidth: '90%',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        verticalAlign: 'middle',
                                      }}>{option.name}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                            {/* 2. Company Dropdown */}
                              <div className="relative" ref={companyDropdownRef}>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">Step 2: Company</label>
                              <button
                                type="button"
                                className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-left text-gray-700 hover:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100 transition-all disabled:bg-gray-100 disabled:text-gray-400"
                                onClick={() => setCurrentSelection(prev => ({
                                  ...prev,
                                  companyDropdownOpen: !prev.companyDropdownOpen,
                                  domainDropdownOpen: false,
                                  locationDropdownOpen: false
                                }))}
                                disabled={!currentSelection.domain || choices.length >= 4 || availableCompanies.length === 0}
                              >
                                <span className={availableCompanies.length === 0 ? "text-gray-400" : ""}>
                                  {currentSelection.company ? currentSelection.company.name : (availableCompanies.length === 0 ? "No companies available" : "Select a company...")}
                                </span>
                                <MdArrowDropDown className={`text-2xl text-gray-400 transition-transform ${currentSelection.companyDropdownOpen ? 'rotate-180' : ''}`} />
                              </button>
                              {currentSelection.companyDropdownOpen && availableCompanies.length > 0 && (
                                <div className="absolute z-30 mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-100 max-h-40 overflow-y-auto custom-scrollbar">
                                  {availableCompanies.map((option, idx) => (
                                    <button
                                      key={option._id}
                                      type="button"
                                      onClick={() => handleCompanyChange(option)}
                                      className="w-full text-left px-4 py-2.5 hover:bg-red-50 hover:text-red-700 text-gray-700 text-sm border-b border-gray-50 last:border-0 transition-colors flex items-center justify-between group"
                                    >
                                      {option.name}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                            {/* 3. Location Dropdown */}
                              <div className="relative" ref={locationDropdownRef}>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">Step 3: Location</label>
                              <button
                                type="button"
                                className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-left text-gray-700 hover:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100 transition-all disabled:bg-gray-100 disabled:text-gray-400"
                                onClick={() => setCurrentSelection(prev => ({
                                  ...prev,
                                  locationDropdownOpen: !prev.locationDropdownOpen,
                                  domainDropdownOpen: false,
                                  companyDropdownOpen: false
                                }))}
                                disabled={!currentSelection.company || choices.length >= 4 || availableLocations.length === 0}
                              >
                                <span className={availableLocations.length === 0 ? "text-gray-400" : ""}>
                                  {currentSelection.location ? currentSelection.location : (availableLocations.length === 0 ? "No locations available" : "Select a location...")}
                                </span>
                                <MdArrowDropDown className={`text-2xl text-gray-400 transition-transform ${currentSelection.locationDropdownOpen ? 'rotate-180' : ''}`} />
                              </button>
                              {currentSelection.locationDropdownOpen && availableLocations.length > 0 && (
                                <div className="absolute z-30 mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-100 max-h-40 overflow-y-auto custom-scrollbar">
                                  {availableLocations.map((option, idx) => (
                                    <button
                                      key={idx}
                                      type="button"
                                      onClick={() => handleLocationChange(option)}
                                      className="w-full text-left px-4 py-2.5 hover:bg-red-50 hover:text-red-700 text-gray-700 text-sm border-b border-gray-50 last:border-0 transition-colors flex items-center justify-between group"
                                    >
                                      {option}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Error Message */}
                          {error && (
                              <div className="mb-3 text-red-600 text-sm font-medium flex items-center gap-1">
                                  <MdWarning /> {error}
                              </div>
                          )}

                          {/* Add Button */}
                          <div className="flex justify-end">
                              <button 
                                  onClick={handleAddChoice}
                                  disabled={choices.length >= 4}
                                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                                      choices.length >= 4 
                                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                      : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                                  }`}
                              >
                                  {choices.length >= 4 ? "Max Limit Reached" : "Add to List"}
                              </button>
                          </div>
                      </div>

                      {/* --- SELECTED LIST DISPLAY --- */}
                      <div className="px-4 mb-8">
                          <div className="flex items-center gap-3">
                              <div className="p-2 bg-red-50 rounded-lg">
                                  <MdLowPriority className="text-red-600 w-5 h-5" />
                              </div>
                              <span className="text-lg font-bold text-gray-800">Your Priority List ({choices.length}/4)</span>
                          </div>

                          <div className="flex flex-col gap-3 p-2.5 bg-gray-50 rounded-xl mt-4">
                              {choices.length > 0 ? (
                                  choices.map((item) => (
                                      <div key={item.id} className="flex items-center bg-white border border-gray-200 py-2.5 px-4 rounded-xl shadow-sm hover:border-red-200 transition-all">
                                          
                                          {/* Priority Badge */}
                                          <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-bold text-lg mr-4 shrink-0 border border-red-100">
                                              {item.priority}
                                          </div>

                                          {/* Details */}
                                          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                                            <div className="flex items-center gap-2 text-gray-800 font-medium">
                                              <MdBusiness className="text-gray-400" />
                                              {item.company && item.company.name ? item.company.name : ''}
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600 text-sm">
                                              <MdLocationOn className="text-gray-400" />
                                              {item.location}
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-500 text-xs md:justify-start">
                                              <MdDomain className="text-gray-400" />
                                              {item.domain && item.domain.name ? item.domain.name : ''}
                                            </div>
                                          </div>

                                          {/* Delete Button */}
                                          <button 
                                              onClick={() => handleRemoveChoice(item.id)}
                                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors ml-2"
                                          >
                                              <MdDelete size={20} />
                                          </button>
                                      </div>
                                  ))
                              ) : (
                                  <div className="text-center py-8 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-gray-400">
                                      No priorities added yet. Use the form above to add your choices.
                                  </div>
                              )}
                          </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="px-6 py-4 flex justify-end gap-4">
                          <Link 
                              to="/student-dashboard" 
                              className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                          >
                              Cancel
                          </Link>
                          <button 
                              onClick={() => setShowConfirmModal(true)}
                              className="px-6 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                          >
                              <MdSave className="text-lg" />
                              Submit Choices
                          </button>

                          {/* Confirmation Modal */}
                          {showConfirmModal && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
                              <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
                                <div className="mb-4">
                                  <svg className="w-12 h-12 mx-auto text-red-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12l2.5 2.5L16 9" />
                                  </svg>
                                </div>
                                <div className="text-lg font-semibold text-gray-800 mb-2">Are you sure you want to submit?</div>
                                <div className="text-gray-500 text-sm mb-6">Once you submit your application, you <span className='font-bold text-red-600'>cannot change your preferences</span>.<br/>Please confirm to proceed.</div>
                                <div className="flex justify-center gap-4">
                                  <button
                                    onClick={() => setShowConfirmModal(false)}
                                    className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => { setShowConfirmModal(false); handleSave(); }}
                                    className="px-5 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 shadow-sm transition-colors"
                                  >
                                    Yes, Submit
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                      </div>
                  </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 my-6 px-3 md:px-0">
                      <svg className="w-14 h-14 text-green-400 mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12l2.5 2.5L16 9" />
                      </svg>
                      <div className="text-xl font-semibold text-green-600 mb-1">Application Submitted</div>
                      <div className="text-gray-500 text-base max-w-lg text-justify md:!text-center mb-2">
                        You have already submitted your internship preferences.<br/>
                        Your application is now under review. You cannot add or modify choices at this stage.
                      </div>
                      <div className="text-gray-400 text-sm max-w-lg text-justify md:!text-center">
                        If you have any questions or need to update your application, please contact the Training & Placement Office.
                      </div>
                    </div>
                )}
            </div>
        </div>
      </section>
    </div>
  );
}

export default ApplyCompany;