import React, { useState } from "react";
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
  MdArrowDropDown
} from "react-icons/md";
import HeaderProfile from "../../../components/HeaderProfile"; 

// --- MOCK DATA FOR DROPDOWNS ---
const MOCK_DOMAINS = [
  "Artificial Intelligence",
  "Machine Learning", 
  "Web Development (Full Stack)",
  "Cyber Security",
  "Cloud Computing",
  "Data Science",
  "DevOps"
];

const MOCK_BRANCHES = [
  "Computer Science (CSE)",
  "Information Technology (IT)",
  "Electronics (ECE)",
  "Mechanical Engineering (ME)",
  "Civil Engineering (CE)",
  "Electrical Engineering (EE)"
];

function AddDomain() {
    // Ref for branch dropdown
    const branchRef = React.useRef(null);
    // Mock Admin Data
    const adminData = {
        email: "admin@college.edu",
        fullName: "Placement Officer",
        role: "Admin"
    };

    // --- STATE MANAGEMENT ---
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        applicableBranches: []
    });

    const [isBranchOpen, setIsBranchOpen] = useState(false);

    // Close branch dropdown on outside click
    React.useEffect(() => {
        function handleClickOutside(event) {
            if (branchRef.current && !branchRef.current.contains(event.target) && isBranchOpen) {
                setIsBranchOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isBranchOpen]);

    // Branch dropdown toggle
    const handleBranchDropdown = () => {
        setIsBranchOpen((prev) => !prev);
    };

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Add branch to applicableBranches
    const addBranch = (branch) => {
        if (!formData.applicableBranches.includes(branch)) {
            setFormData((prev) => ({ ...prev, applicableBranches: [...prev.applicableBranches, branch] }));
        }
    };

    // Remove branch from applicableBranches
    const removeBranch = (branch) => {
        setFormData((prev) => ({ ...prev, applicableBranches: prev.applicableBranches.filter(b => b !== branch) }));
    };

    // Submit handler
    const handleSubmit = () => {
        if (!formData.name || formData.applicableBranches.length === 0) {
            alert("Please fill in all required fields.");
            return;
        }
        console.log("Submitting Domain Data:", formData);
        alert("Domain Added Successfully!");
    };

    return (
        <div className="flex bg-gradient-to-br from-gray-100 via-white to-gray-200 min-h-[calc(100vh-5rem)]">
            {/* Main Content */}
            <section className="w-full max-w-7xl mx-auto px-0 md:px-0">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-12 p-0 md:p-0">
                    <HeaderProfile data={adminData} />
                    <div className="mt-8 px-0 md:px-8 pb-8">
                        {/* Page Title */}
                        <h3 className="text-xl font-semibold !text-gray-700 mb-2 border-b pb-2 px-6 md:px-0">
                            Add New Domain
                        </h3>
                        <p className="text-sm text-gray-500 mb-6 px-6 md:px-0">
                            Enter domain details and select applicable branches.
                        </p>
                        <div className="px-4 mb-8">
                            <div className="grid grid-cols-1 gap-6 mb-4 pt-3">
                                {/* Domain Name */}
                                <div ref={branchRef}>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Domain Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full bg-white border border-gray-300 text-gray-700 py-2.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-500 transition-all"
                                        placeholder="e.g. Non-Tech Roles"
                                    />
                                </div>
                                {/* Description */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        className="w-full bg-white border border-gray-300 text-gray-700 py-2.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-500 transition-all"
                                        placeholder="Domain description (optional)"
                                    />
                                </div>
                                {/* Branch Multi-Select Dropdown */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Applicable Branches</label>
                                    {/* Selected Pills */}
                                    <div className="min-h-[50px] p-3 bg-white border border-gray-300 rounded-lg flex flex-wrap gap-2 mb-2 mt-3">
                                        {formData.applicableBranches.map((branch, i) => (
                                            <span key={i} className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 border border-red-300 text-xs font-semibold rounded-full shadow-sm">
                                                {branch}
                                                <button onClick={() => removeBranch(branch)} className="hover:text-red-900"><MdClose /></button>
                                            </span>
                                        ))}
                                        {formData.applicableBranches.length === 0 && <span className="text-gray-400 text-xs py-1">No branches selected</span>}
                                    </div>
                                    {/* Dropdown */}
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={handleBranchDropdown}
                                            className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-red-400"
                                        >
                                            Select Branches...
                                            <MdArrowDropDown />
                                        </button>
                                        {isBranchOpen && (
                                            <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                                {MOCK_BRANCHES.filter(b => !formData.applicableBranches.includes(b)).map((b, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => addBranch(b)}
                                                        className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 hover:text-red-700 flex justify-between group"
                                                    >
                                                        {b} <MdAdd className="opacity-0 group-hover:opacity-100" />
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
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
                                Add Domain
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default AddDomain;