import React, { useEffect, useState } from "react";
import { 
  MdBusiness, 
  MdLocationOn, 
  MdGroup, 
  MdSave, 
  MdDomain, 
  MdSchool, 
  MdClose, 
  MdArrowDropDown,
  MdDescription,
  MdCheckCircle
} from "react-icons/md";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import { toast } from "react-toastify";
import ErrorMessage from "../../../components/ErrorMessage";
import { getAllCompaniesAsync, updateCompanyAsync } from "../../../store/slices/companySlice";

function UpdateCompany({ onClose, initialData = null }) {
    const { allDomains = [], allBranches = [] } = useAppSelector((state) => state.domainBranch || {});
    const dispatch = useAppDispatch();
    
    // UI States for Dropdowns
    const [isDomainOpen, setIsDomainOpen] = useState(false);
    const [isBranchOpen, setIsBranchOpen] = useState(false);
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    
    // Refs for dropdowns
    const domainRef = React.useRef(null);
    const branchRef = React.useRef(null);
    const statusRef = React.useRef(null);
    
    // Error state
    const [errors, setErrors] = useState({});
    
    // Form data initialized with company data
    const [formData, setFormData] = useState(() => ({
        name: initialData?.name || "",
        location: {
            city: initialData?.location?.city || "",
            state: initialData?.location?.state || ""
        },
        domainTags: Array.isArray(initialData?.domainTags)
            ? initialData.domainTags.map(d => d._id || d)
            : [],
        allowedBranches: Array.isArray(initialData?.allowedBranches)
            ? initialData.allowedBranches.map(b => b._id || b)
            : [],
        totalSeats: initialData?.totalSeats ? String(initialData.totalSeats) : "",
        stipendAmount: initialData?.stipendAmount || "",
        recruitmentStatus: initialData?.recruitmentStatus || "OPEN"
    }));

    // Close dropdowns on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (domainRef.current && !domainRef.current.contains(event.target) && isDomainOpen) {
                setIsDomainOpen(false);
            }
            if (branchRef.current && !branchRef.current.contains(event.target) && isBranchOpen) {
                setIsBranchOpen(false);
            }
            if (statusRef.current && !statusRef.current.contains(event.target) && isStatusOpen) {
                setIsStatusOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isDomainOpen, isBranchOpen, isStatusOpen]);

    // Dropdown handlers
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
    const handleStatusDropdown = () => {
        setIsStatusOpen((prev) => !prev);
    };

    // Input handlers
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

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

    // Domain handlers
    const addDomain = (domainObj) => {
        if (!formData.domainTags.includes(domainObj._id)) {
            setFormData(prev => ({ ...prev, domainTags: [...prev.domainTags, domainObj._id] }));
            setIsDomainOpen(false);
        }
    };
    
    const removeDomain = (domainId) => {
        setFormData(prev => ({ ...prev, domainTags: prev.domainTags.filter(d => d !== domainId) }));
    };

    // Branch handlers
    const addBranch = (branchObj) => {
        if (!formData.allowedBranches.includes(branchObj._id)) {
            setFormData(prev => ({ ...prev, allowedBranches: [...prev.allowedBranches, branchObj._id] }));
            setIsBranchOpen(false);
        }
    };
    
    const removeBranch = (branchId) => {
        setFormData(prev => ({ ...prev, allowedBranches: prev.allowedBranches.filter(b => b !== branchId) }));
    };

    // Update handler
    const handleUpdate = async () => {
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

        const payload = {
            name: formData.name,
            location: {
                city: formData.location.city,
                state: formData.location.state
            },
            domainTags: formData.domainTags,
            allowedBranches: formData.allowedBranches,
            totalSeats: Number(formData.totalSeats),
            stipendAmount: formData.stipendAmount || "N/A",
            recruitmentStatus: formData.recruitmentStatus
        };

        try {
            const response = await dispatch(updateCompanyAsync({ companyId: initialData._id, companyData: payload })).unwrap();
            if (response.success === true || response.statusCode === 200) {
                await dispatch(getAllCompaniesAsync());
                setErrors({});
                toast.success(response.message || "Company Updated Successfully!");
                onClose();
            }
        } catch (err) {
            setErrors({ general: err.message || "Failed to update company. Please try again." });
            toast.error(err.message || "Failed to update company. Please try again.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm animate-fadeIn bg-opacity-40">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 w-full max-w-4xl mx-auto p-0 md:p-0 relative animate-fadeIn max-h-[80vh] overflow-y-auto">
                <button
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-600 text-xl z-10"
                    onClick={onClose}
                    title="Close"
                >
                    <MdClose />
                </button>
                
                <div className="mt-8 px-0 md:px-8 pb-8">
                    <h3 className="text-xl font-semibold !text-gray-700 mb-2 border-b pb-2 px-6 md:px-0">
                        Update Company
                    </h3>
                    <p className="text-sm text-gray-500 mb-6 px-6 md:px-0">
                        Edit company details, eligibility criteria, and hiring capacity.
                    </p>

                    {/* Recruitment Status */}
                    <div className="px-4 mb-8">
                        <div className="mt-4 w-1/2 relative" ref={statusRef}>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Recruitment Status</label>
                            <button
                                type="button"
                                onClick={handleStatusDropdown}
                                className={`w-full flex items-center justify-between px-4 py-2 bg-white border rounded-lg text-sm focus:outline-none transition-colors ${
                                    formData.recruitmentStatus === "OPEN"
                                        ? "text-green-700 border-green-300"
                                        : formData.recruitmentStatus === "PAUSED"
                                            ? "text-yellow-700 border-yellow-300"
                                            : "text-red-700 border-red-300"
                                } hover:border-red-400`}
                            >
                                <span className={`font-bold ${
                                    formData.recruitmentStatus === "OPEN"
                                        ? "text-green-700"
                                        : formData.recruitmentStatus === "PAUSED"
                                            ? "text-yellow-700"
                                            : "text-red-700"
                                }`}>
                                    {formData.recruitmentStatus}
                                </span>
                                <MdArrowDropDown className="ml-2 text-gray-400" />
                            </button>
                            {isStatusOpen && (
                                <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                                    <button
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-green-50 hover:text-green-700 ${
                                            formData.recruitmentStatus === "OPEN" ? "font-bold text-green-700" : ""
                                        }`}
                                        onClick={() => {
                                            setFormData((prev) => ({ ...prev, recruitmentStatus: "OPEN" }));
                                            setIsStatusOpen(false);
                                        }}
                                    >
                                        OPEN
                                    </button>
                                    <button
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-yellow-50 hover:text-yellow-700 ${
                                            formData.recruitmentStatus === "PAUSED" ? "font-bold text-yellow-700" : ""
                                        }`}
                                        onClick={() => {
                                            setFormData((prev) => ({ ...prev, recruitmentStatus: "PAUSED" }));
                                            setIsStatusOpen(false);
                                        }}
                                    >
                                        PAUSED
                                    </button>
                                    <button
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-red-50 hover:text-red-700 ${
                                            formData.recruitmentStatus === "CLOSED" ? "font-bold text-red-700" : ""
                                        }`}
                                        onClick={() => {
                                            setFormData((prev) => ({ ...prev, recruitmentStatus: "CLOSED" }));
                                            setIsStatusOpen(false);
                                        }}
                                    >
                                        CLOSED
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SECTION 1: BASIC INFO */}
                    <div className="px-4 mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-50 rounded-lg">
                                <MdBusiness className="text-red-600 w-5 h-5" />
                            </div>
                            <span className="text-lg font-bold text-gray-800">Company Information</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4 pt-3">
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
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Stipend Amount (₹)</label>
                                <div className="relative">
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
                        {/* Domain Tags */}
                        <div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-50 rounded-lg">
                                    <MdDomain className="text-red-600 w-5 h-5" />
                                </div>
                                <span className="text-lg font-bold text-gray-800">Technical Domains</span>
                            </div>
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
                                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-red-50 hover:text-red-700 ${isSelected ? 'font-bold text-red-600' : ''}`}
                                                    onClick={() => isSelected ? removeDomain(d._id) : addDomain(d)}
                                                >
                                                    {d.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Eligible Branches */}
                        <div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-50 rounded-lg">
                                    <MdSchool className="text-red-600 w-5 h-5" />
                                </div>
                                <span className="text-lg font-bold text-gray-800">Eligible Branches</span>
                            </div>
                            <div className="min-h-[50px] p-3 bg-white border border-gray-300 rounded-lg flex flex-wrap gap-2 mb-2 mt-3">
                                {formData.allowedBranches.map((branchId, i) => {
                                    const branchObj = allBranches.find(b => b._id === branchId);
                                    return (
                                        <span key={i} className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 border border-gray-300 text-xs font-semibold rounded-full shadow-sm">
                                            {branchObj ? branchObj.name : branchId}
                                            <button onClick={() => removeBranch(branchId)} className="hover:text-gray-900"><MdClose /></button>
                                        </span>
                                    );
                                })}
                                {formData.allowedBranches.length === 0 && <span className="text-gray-400 text-xs py-1">No branches selected</span>}
                            </div>
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
                                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-red-50 hover:text-red-700 ${isSelected ? 'font-bold text-red-600' : ''}`}
                                                    onClick={() => isSelected ? removeBranch(b._id) : addBranch(b)}
                                                >
                                                    {b.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <ErrorMessage err={errors.general} close={() => setErrors({ general: '' })} />

                    <div className="px-6 py-4 flex justify-end gap-4">
                        <button 
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleUpdate}
                            className="px-6 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                        >
                            <MdSave className="text-lg" />
                            Update Company
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UpdateCompany;
