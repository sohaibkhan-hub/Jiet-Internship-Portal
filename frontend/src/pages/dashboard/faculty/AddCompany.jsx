import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  MdBusiness, 
  MdLocationOn, 
  MdAttachMoney, 
  MdGroup, 
  MdSave, 
  MdDomain, 
  MdSchool, 
  MdAdd, 
  MdClose, 
  MdArrowDropDown,
  MdDescription
} from "react-icons/md";
import HeaderProfile from "../../../components/HeaderProfile"; 
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import { toast } from "react-toastify";
import ErrorMessage from "../../../components/ErrorMessage";
import { addCompanyAsync, getAllCompaniesAsync } from "../../../store/slices/companySlice";
import { getAllBranchesAsync, getAllDomainsAsync } from "../../../store/slices/branchDomainSlice";

function AddCompany() {

    const { allDomains = [], allBranches = [] } = useAppSelector((state) => state.domainBranch || {});
    const dispatch = useAppDispatch();
    // UI States for Dropdowns (move above useEffect)
    const [isDomainOpen, setIsDomainOpen] = useState(false);
    const [isBranchOpen, setIsBranchOpen] = useState(false);
    // Refs for dropdowns
    const domainRef = React.useRef(null);
    const branchRef = React.useRef(null);
    // --- STATE MANAGEMENT ---
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        name: "",
        location: {
        city: "",
        state: ""
        },
        domainTags: [],     // Stores selected domains
        allowedBranches: [], // Stores selected branches
        totalSeats: "",
        stipendAmount: ""
    });
    useEffect(() => {
        dispatch(getAllBranchesAsync());
        dispatch(getAllDomainsAsync());
    }, [dispatch]);

    // Close dropdowns on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (domainRef.current && !domainRef.current.contains(event.target) && isDomainOpen) {
                setIsDomainOpen(false);
            }
            if (branchRef.current && !branchRef.current.contains(event.target) && isBranchOpen) {
                setIsBranchOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isDomainOpen, isBranchOpen]);

    // Ensure only one dropdown is open at a time
    const handleDomainDropdown = () => {
        setIsDomainOpen((prev) => {
            if (!prev) setIsBranchOpen(false);
            return !prev;
        });
    };
    const handleBranchDropdown = () => {
        setIsBranchOpen((prev) => {
            if (!prev) setIsDomainOpen(false);
            return !prev;
        });
    };

  // --- HANDLERS ---

  // 1. Handle Basic Text Inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

    // 2. Handle Location Inputs (Nested Object)
    const handleLocationChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
        ...prev,
        location: {
            ...prev.location,
            [name]: value
        }
        }));
    };
    // 3. Domain Handlers (store _id, show name)
    const addDomain = (domainObj) => {
        if (!formData.domainTags.includes(domainObj._id)) {
            setFormData(prev => ({ ...prev, domainTags: [...prev.domainTags, domainObj._id] }));
            setIsDomainOpen(false);
        }
        // else do nothing (prevent duplicate)
    };
    const removeDomain = (domainId) => {
        setFormData(prev => ({ ...prev, domainTags: prev.domainTags.filter(d => d !== domainId) }));
    };

    // 4. Branch Handlers (store _id, show name)
    const addBranch = (branchObj) => {
        if (!formData.allowedBranches.includes(branchObj._id)) {
            setFormData(prev => ({ ...prev, allowedBranches: [...prev.allowedBranches, branchObj._id] }));
            setIsBranchOpen(false);
        }
        // else do nothing (prevent duplicate)
    };
    const removeBranch = (branchId) => {
        setFormData(prev => ({ ...prev, allowedBranches: prev.allowedBranches.filter(b => b !== branchId) }));
    };

    // 5. Submit
    const handleSubmit = async () => {
        // Basic Validation
        if (!formData.name || !formData.totalSeats) {
            setErrors({ general: "Please fill in all required fields." });
            return;
        }
        if (!formData.domainTags.length) {
            setErrors({ general: "Please select at least one domain." });
            return;
        }
        if (!formData.allowedBranches.length) {
            setErrors({ general: "Please select at least one branch." });
            return;
        }

        // Ensure only IDs are sent for domains and branches
        const payload = {
            name: formData.name,
            location: {
                city: formData.location.city,
                state: formData.location.state
            },
            domainTags: formData.domainTags, // already array of IDs
            allowedBranches: formData.allowedBranches, // already array of IDs
            totalSeats: Number(formData.totalSeats),
            stipendAmount: formData.stipendAmount || "N/A"
        };

        try {
            const response = await dispatch(addCompanyAsync(payload)).unwrap();
            if (response.success === true || response.statusCode === 200) {
                await dispatch(getAllCompaniesAsync());
                setFormData({
                    name: "",
                    location: { city: "", state: "" },
                    domainTags: [],
                    allowedBranches: [],
                    totalSeats: "",
                    stipendAmount: ""
                });
                setErrors({});
                toast.success(response.message || "Company Added Successfully!");
            }
        } catch (err) {
            setErrors({ general: err.message || "Failed to add company. Please try again." });
            toast.error(err.message || "Failed to add company. Please try again.");
        }
    };

    // Filter available options for dropdowns
    const availableDomains = allDomains.filter(d => !formData.domainTags.includes(d._id));
    const availableBranches = allBranches.filter(b => !formData.allowedBranches.includes(b._id));

  return (
    <div className="flex bg-gradient-to-br from-gray-100 via-white to-gray-200 min-h-[calc(100vh-5rem)]">

      {/* Main Content */}
      <section className="w-full max-w-7xl mx-auto px-0 md:px-0">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-12 p-0 md:p-0">
            
            <HeaderProfile />

            <div className="mt-8 px-0 md:px-8 pb-8">
                {/* Page Title */}
                 <h3 className="text-xl font-semibold !text-gray-700 mb-2 border-b pb-2 px-6 md:px-0">
                    Add New Company
                </h3>
                <p className="text-sm text-gray-500 mb-6 px-6 md:px-0">
                    Enter company details, eligibility criteria, and hiring capacity.
                </p>

                {/* SECTION 1: BASIC INFO */}
                <div className="px-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-50 rounded-lg">
                            <MdBusiness className="text-red-600 w-5 h-5" />
                        </div>
                        <span className="text-lg font-bold text-gray-800">Company Information</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4 pt-3">
                        {/* Company Name */}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Company Name</label>
                            <input 
                                type="text" 
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full bg-white border border-gray-300 text-gray-700 py-2.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-500 transition-all"
                                placeholder="e.g. Google India Pvt Ltd"
                            />
                        </div>

                        {/* City */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">City</label>
                            <div className="relative">
                                <MdLocationOn className="absolute left-3 top-3 text-gray-400" />
                                <input 
                                    type="text" 
                                    name="city"
                                    required
                                    value={formData.location.city}
                                    onChange={handleLocationChange}
                                    className="w-full bg-white border border-gray-300 text-gray-700 py-2.5 pl-10 pr-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-500 transition-all"
                                    placeholder="e.g. Bangalore"
                                />
                            </div>
                        </div>

                        {/* State */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">State</label>
                            <input 
                                type="text" 
                                name="state"
                                required
                                value={formData.location.state}
                                onChange={handleLocationChange}
                                className="w-full bg-white border border-gray-300 text-gray-700 py-2.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-500 transition-all"
                                placeholder="e.g. Karnataka"
                            />
                        </div>
                    </div>
                </div>

                {/* SECTION 2: RECRUITMENT DETAILS */}
                <div className="px-4 mb-8">

                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-50 rounded-lg">
                            <MdDescription className="text-red-600 w-5 h-5" />
                        </div>
                        <span className="text-lg font-bold text-gray-800">Recruitment Details</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4 pt-3">
                        {/* Total Seats */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Total Seats</label>
                            <div className="relative">
                                <MdGroup className="absolute left-3 top-3 text-gray-400" />
                                <input 
                                    type="number" 
                                    name="totalSeats"
                                    required
                                    value={formData.totalSeats}
                                    onChange={handleInputChange}
                                    className="w-full bg-white border border-gray-300 text-gray-700 py-2.5 pl-10 pr-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-500 transition-all"
                                    placeholder="e.g. 10"
                                />
                            </div>
                        </div>

                        {/* Stipend */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Stipend Amount (₹)</label>
                            <div className="relative">
                                {/* <MdAttachMoney className="absolute left-3 top-3 text-gray-400" /> */}
                                <input 
                                    type="text" 
                                    name="stipendAmount"
                                    value={formData.stipendAmount}
                                    onChange={handleInputChange}
                                    className="w-full bg-white border border-gray-300 text-gray-700 py-2.5 pl-4 pr-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-500 transition-all"
                                    placeholder="e.g. ₹25000, Performance Based, N/A"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECTION 3: MULTI-SELECTS (Domains & Branches) */}
                <div className="px-4 mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 3a. DOMAIN TAGS */}
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-50 rounded-lg">
                                <MdDomain className="text-red-600 w-5 h-5" />
                            </div>
                            <span className="text-lg font-bold text-gray-800">Technical Domains</span>
                        </div>
                        {/* Selected Pills */}
                        <div className="min-h-[50px] p-3 bg-white border border-gray-300 rounded-lg flex flex-wrap gap-2 mb-2 mt-3">
                            {formData.domainTags.map((domainId, i) => {
                              const domainObj = allDomains.find(d => d._id === domainId);
                              return (
                                <span key={i} className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 border border-red-300 text-xs font-semibold rounded-full shadow-sm">
                                    {domainObj ? domainObj.name : domainId}
                                    <button onClick={() => removeDomain(domainId)} className="hover:text-red-900"><MdClose /></button>
                                </span>
                              );
                            })}
                            {formData.domainTags.length === 0 && <span className="text-gray-400 text-xs py-1">No domains selected</span>}
                        </div>
                        {/* Dropdown */}
                        <div className="relative" ref={domainRef}>
                            <button 
                                onClick={handleDomainDropdown}
                                className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-red-400"
                            >
                                Select Domains...
                                <MdArrowDropDown />
                            </button>
                            {isDomainOpen && (
                                <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                    {allDomains.map((d, i) => {
                                        const isSelected = formData.domainTags.includes(d._id);
                                        return (
                                            <button
                                                key={d._id}
                                                onClick={() => !isSelected && addDomain(d)}
                                                className={`w-full text-left px-4 py-2 text-sm flex justify-between group ${isSelected ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-red-50 hover:text-red-700 text-gray-700'}`}
                                                disabled={isSelected}
                                            >
                                                {d.name} <MdAdd className={`transition-opacity ${isSelected ? 'opacity-0' : 'opacity-0 group-hover:opacity-100 text-red-600'}`} />
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                    {/* 3b. ALLOWED BRANCHES */}
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-50 rounded-lg">
                                <MdSchool className="text-red-600 w-5 h-5" />
                            </div>
                            <span className="text-lg font-bold text-gray-800">Eligible Branches</span>
                        </div>
                        {/* Selected Pills */}
                        <div className="min-h-[50px] p-3 bg-white border border-gray-300 rounded-lg flex flex-wrap gap-2 mb-2 mt-3">
                            {formData.allowedBranches.map((branchId, i) => {
                              const branchObj = allBranches.find(b => b._id === branchId);
                              return (
                                <span key={i} className="flex items-center gap-1 px-3 py-1 bg-red-50 text-red-600 border border-red-200 text-xs font-semibold rounded-full shadow-sm">
                                    {branchObj ? branchObj.name : branchId}
                                    <button onClick={() => removeBranch(branchId)} className="hover:text-red-900"><MdClose /></button>
                                </span>
                              );
                            })}
                            {formData.allowedBranches.length === 0 && <span className="text-gray-400 text-xs py-1">No branches selected</span>}
                        </div>
                        {/* Dropdown */}
                        <div className="relative" ref={branchRef}>
                            <button 
                                onClick={handleBranchDropdown}
                                className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-red-400"
                            >
                                Select Branches...
                                <MdArrowDropDown />
                            </button>
                            {isBranchOpen && (
                                <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                    {allBranches.map((b, i) => {
                                        const isSelected = formData.allowedBranches.includes(b._id);
                                        return (
                                            <button
                                                key={b._id}
                                                onClick={() => !isSelected && addBranch(b)}
                                                className={`w-full text-left px-4 py-2 text-sm flex justify-between group ${isSelected ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-red-50 hover:text-red-700 text-gray-700'}`}
                                                disabled={isSelected}
                                            >
                                                {b.name} <MdAdd className={`transition-opacity ${isSelected ? 'opacity-0' : 'opacity-0 group-hover:opacity-100 text-red-600'}`} />
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <ErrorMessage err={errors.general} close={() => setErrors({ general: '' })} />

                {/* ACTIONS */}
                <div className="px-6 py-4 flex justify-end gap-4">
                    <Link 
                        to="/admin/companies" 
                        className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                    >
                        Cancel
                    </Link>
                    <button 
                        onClick={handleSubmit}
                        className="px-6 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                    >
                        <MdSave className="text-lg" />
                        Create Company
                    </button>
                </div>
            </div>
        </div>
      </section>
    </div>
  );
}

export default AddCompany;