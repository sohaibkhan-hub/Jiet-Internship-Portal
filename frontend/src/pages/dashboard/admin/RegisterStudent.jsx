import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  MdSave, 
  MdArrowDropDown,
} from "react-icons/md";
import HeaderProfile from "../../../components/HeaderProfile"; 
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import { getAllBranchesAsync } from "../../../store/slices/branchDomainSlice";

import { registerStudentAsync } from "../../../store/slices/adminSlice";
import { toast } from "react-toastify";

function RegisterStudent() {
    // Fetch branches from API
    const { allBranches = [] } = useAppSelector((state) => state.domainBranch || {});
    const dispatch = useAppDispatch();
    // Ref for branch dropdown
    const branchRef = React.useRef(null);
    useEffect(() => {
        dispatch(getAllBranchesAsync());
    }, [dispatch]);

    const [isBranchOpen, setIsBranchOpen] = useState(false);;
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
    });

    // Close branch dropdown on outside click
    useEffect(() => {
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

    // Submit handler
    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        if (!formData.branchId) {
            toast.error("Please select a branch.");
            return;
        }

        try {
            const response = await dispatch(registerStudentAsync(formData)).unwrap();
            
            if (response.success === true || response.statusCode === 200) {
                toast.success(response.message || "Student registered successfully!");
                setFormData({ email: "", fullName: "", rollNumber: "", registrationNumber: "", fatherName: "", dateOfBirth: "", phoneNumber: "", branchId: "", year: "" });
            } else {
                toast.error(response.message || "Failed to register student.");
            }
        } catch (err) {
            toast.error(err.message || "Failed to register student.");
        }
    };

    return (
        <div className="flex bg-gradient-to-br from-gray-100 via-white to-gray-200 min-h-[calc(100vh-5rem)]">
            {/* Main Content */}
            <section className="w-full max-w-7xl mx-auto px-0 md:px-0">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-12 p-0 md:p-0">
                    <HeaderProfile />
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
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
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
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name</label>
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
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Father's Name</label>
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
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Roll Number</label>
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
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Registration Number</label>
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
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Date of Birth</label>
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
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        required
                                        pattern="[0-9]{10}"
                                        value={formData.phoneNumber}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#EF5350] bg-gray-50"
                                        placeholder="e.g. 9876543210"
                                    />
                                </div>
                                {/* Year */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Year</label>
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
                                {/* Branch Dropdown */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Branch</label>
                                    <div className="relative" ref={branchRef}>
                                        <button
                                            type="button"
                                            onClick={handleBranchDropdown}
                                            className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-red-400"
                                        >
                                            {formData.branchId ? (allBranches.find(b => b._id === formData.branchId)?.name || "Select Branch...") : "Select Branch..."}
                                            <MdArrowDropDown />
                                        </button>
                                        {isBranchOpen && (
                                            <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                                {allBranches.length > 0 ? allBranches.map((b) => (
                                                    <button
                                                        key={b._id}
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
                            </div>
                        </div>
                        {/* ACTIONS */}
                        <div className="px-6 py-4 flex justify-end gap-4">
                            <Link
                                onClick={() =>
                                    setFormData({ email: "", fullName: "", rollNumber: "", registrationNumber: "", fatherName: "", dateOfBirth: "", phoneNumber: "", branchId: "", year: "" })
                                } className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
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
                </div>
            </section>
        </div>
    );
}

export default RegisterStudent;