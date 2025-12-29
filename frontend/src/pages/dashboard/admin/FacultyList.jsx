import React, { useState, useMemo, useEffect, useRef } from "react";
import { MdSearch, MdFilterList, MdRefresh, MdArrowDropDown } from "react-icons/md";
import HeaderProfile from "../../../components/HeaderProfile";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import { getAllFacultyDetailsAsync } from "../../../store/slices/adminSlice";
import { getAllBranchesAsync, getAllDomainsAsync } from "../../../store/slices/branchDomainSlice";

function FacultyList() {
    // Dropdown open state for custom filters
    const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
    const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
    const branchDropdownRef = useRef(null);
    const roleDropdownRef = useRef(null);
        // Close dropdowns on outside click
        useEffect(() => {
            function handleClickOutside(event) {
                if (branchDropdownOpen && branchDropdownRef.current && !branchDropdownRef.current.contains(event.target)) {
                    setBranchDropdownOpen(false);
                }
                if (roleDropdownOpen && roleDropdownRef.current && !roleDropdownRef.current.contains(event.target)) {
                    setRoleDropdownOpen(false);
                }
            }
            document.addEventListener("mousedown", handleClickOutside);
            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }, [branchDropdownOpen, roleDropdownOpen]);
    const allFacultyDetails = useAppSelector((state) => state.admin.allFacultyDetails || []);
    const { allBranches = [] } = useAppSelector((state) => state.domainBranch || {});

    const dispatch = useAppDispatch();
    useEffect(() => {
        dispatch(getAllFacultyDetailsAsync());
        dispatch(getAllDomainsAsync());
        dispatch(getAllBranchesAsync());
    }, [dispatch]);

    // Helper to close all dropdowns
    const closeAllDropdowns = () => {
        setBranchDropdownOpen(false);
        setRoleDropdownOpen(false);
    };

    // --- FILTER STATE ---
    const [filters, setFilters] = useState({
        search: "",
        branch: "ALL",
        role: "ALL"
    });

    // --- FACULTY DATA FROM API ---
    const FACULTY_LIST = Array.isArray(allFacultyDetails) ? allFacultyDetails : [];

    // --- FILTER LOGIC ---
    const filteredFaculty = useMemo(() => {
        return FACULTY_LIST.filter(fac => {
            // 1. Search (by fullName or email)
            const matchesSearch =
                (fac.fullName && fac.fullName.toLowerCase().includes(filters.search.toLowerCase())) ||
                (fac.email && fac.email.toLowerCase().includes(filters.search.toLowerCase()));
            // 2. Branch
            const matchesBranch = filters.branch === "ALL" || (fac.branch && fac.branch.name === filters.branch);
            // 3. Role
            const matchesRole = filters.role === "ALL" || fac.role === filters.role;
            return matchesSearch && matchesBranch && matchesRole;
        });
    }, [filters, FACULTY_LIST]);

    // Unique values for dropdowns
    const uniqueBranches = useMemo(() => {
        const set = new Set(FACULTY_LIST.map(fac => fac.branch?.name).filter(Boolean));
        return Array.from(set);
    }, [FACULTY_LIST]);
    const uniqueRoles = useMemo(() => {
        const set = new Set(FACULTY_LIST.map(fac => fac.role).filter(Boolean));
        return Array.from(set);
    }, [FACULTY_LIST]);

    // --- HANDLERS ---
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };
    const clearFilters = () => {
        setFilters({ search: "", branch: "ALL", role: "ALL" });
    };

    // ...existing code...
    const [showFilters, setShowFilters] = React.useState(false);

    return (
        <div className="flex bg-gradient-to-br from-gray-100 via-white to-gray-200 md:min-h-[calc(100vh-5rem)]">
            {/* Main Content */}
            <section className="w-full max-w-7xl mx-auto px-0 md:px-0 flex flex-col h-screen overflow-hidden">
                
                {/* Fixed Header Section */}
                <div className="flex-shrink-0 bg-white shadow-sm border-b border-gray-200 z-20">
                    <div className="p-0"> <HeaderProfile /> </div>
                    
                    <div className="mt-8 px-0 md:px-8 pb-2">  
                        {/* Page Title */}
                        <h3 className="text-xl font-semibold !text-gray-700 mb-2 border-b pb-2 px-6 md:px-0">
                            Faculty List
                        </h3>
                        <p className="text-sm text-gray-500 mb-6 px-6 md:px-0">
                            View and manage faculty members.
                        </p>

                        {/* --- FILTERS BAR --- */}
                        {/* Filter Bar Toggle for small screens */}
                        <div className="md:hidden flex justify-end mb-2 mr-2">
                            <button
                                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold shadow hover:bg-red-700 transition-colors"
                                onClick={() => setShowFilters((prev) => !prev)}
                            >
                                {showFilters ? 'Hide Filters' : 'Show Filters'}
                            </button>
                        </div>
                        <div
                            className={`mt-6 bg-gray-50 border border-gray-200 rounded-xl mx-1 p-3 grid grid-cols-1 md:grid-cols-7 gap-3 ${showFilters ? '' : 'hidden'} md:grid`}
                        >
                            {/* Search Input */}
                            <div className="md:col-span-2 relative">
                                <MdSearch className="absolute left-3 top-2.5 text-gray-400 text-lg" />
                                <input 
                                    type="text" 
                                    name="search"
                                    value={filters.search}
                                    onChange={handleFilterChange}
                                    placeholder="Search name or email..." 
                                    className="w-full pl-10 pr-4 py-2 bg-white border border-red-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-500"
                                />
                            </div>
                            {/* Branch Filter */}
                            <div className="relative md:col-span-2" style={{ minWidth: '180px', maxWidth: '320px' }} ref={branchDropdownRef}>
                                <button
                                    type="button"
                                    className={`w-full flex items-center justify-between px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-red-400 focus:outline-none focus:border-red-500 transition-colors ${branchDropdownOpen ? 'border-red-400' : ''}`}
                                    onClick={() => {
                                        if (!branchDropdownOpen) {
                                            closeAllDropdowns();
                                            setBranchDropdownOpen(true);
                                        } else {
                                            setBranchDropdownOpen(false);
                                        }
                                    }}
                                >
                                    {filters.branch === 'ALL' ? 'All Branches' : filters.branch}
                                    <MdArrowDropDown className="ml-2 text-gray-400" />
                                </button>
                                {branchDropdownOpen && (
                                    <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                        <button
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-red-50 hover:text-red-700 ${filters.branch === 'ALL' ? 'font-bold text-red-600' : ''}`}
                                            onClick={() => { setFilters(f => ({ ...f, branch: 'ALL' })); setBranchDropdownOpen(false); }}
                                        >
                                            All Branches
                                        </button>
                                        {uniqueBranches.map((b) => (
                                            <button
                                                key={b}
                                                className={`w-full text-left px-4 py-2 text-sm hover:bg-red-50 hover:text-red-700 ${filters.branch === b ? 'font-bold text-red-600' : ''}`}
                                                onClick={() => { setFilters(f => ({ ...f, branch: b })); setBranchDropdownOpen(false); }}
                                            >
                                                {b}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {/* Role Filter */}
                            <div className="relative md:col-span-1" style={{ minWidth: '120px', maxWidth: '200px' }} ref={roleDropdownRef}>
                                <button
                                    type="button"
                                    className={`w-full flex items-center justify-between px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-red-400 focus:outline-none focus:border-red-500 transition-colors ${roleDropdownOpen ? 'border-red-400' : ''}`}
                                    onClick={() => {
                                        if (!roleDropdownOpen) {
                                            closeAllDropdowns();
                                            setRoleDropdownOpen(true);
                                        } else {
                                            setRoleDropdownOpen(false);
                                        }
                                    }}
                                >
                                    {filters.role === 'ALL' ? 'All Roles' : filters.role}
                                    <MdArrowDropDown className="ml-2 text-gray-400" />
                                </button>
                                {roleDropdownOpen && (
                                    <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                        <button
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-red-50 hover:text-red-700 ${filters.role === 'ALL' ? 'font-bold text-red-600' : ''}`}
                                            onClick={() => { setFilters(f => ({ ...f, role: 'ALL' })); setRoleDropdownOpen(false); }}
                                        >
                                            All Roles
                                        </button>
                                        {uniqueRoles.map((r) => (
                                            <button
                                                key={r}
                                                className={`w-full text-left px-4 py-2 text-sm hover:bg-red-50 hover:text-red-700 ${filters.role === r ? 'font-bold text-red-600' : ''}`}
                                                onClick={() => { setFilters(f => ({ ...f, role: r })); setRoleDropdownOpen(false); }}
                                            >
                                                {r}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {/* Reset Button */}
                            <div className="md:col-span-1 flex items-center">
                                <button 
                                    onClick={clearFilters}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-red-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-700 hover:border-red-500 transition-colors relative w-full"
                                >
                                    <MdRefresh /> Reset
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* --- SCROLLABLE TABLE AREA --- */}
                    <div className="flex-1 overflow-auto mx-1">
                        {/* Result Count Top Right */}
                        <div className="w-full flex justify-end">
                            <div className="font-bold text-red-600 text-sm mb-2 mr-1">
                                Showing {filteredFaculty.length} result(s)
                            </div>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl">
                            <div className="w-full overflow-x-auto">
                                <div className="max-h-[50vh] overflow-y-auto w-full">
                                    <table className="min-w-[900px] w-max text-left border-collapse">
                                    <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200 shadow-sm">
                                        <tr>
                                            <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</th>
                                            <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                                            <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Branch</th>
                                            <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Phone Number</th>
                                            <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                                            <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Designation</th>
                                            <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Program Type</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredFaculty.length > 0 ? (
                                            filteredFaculty.map((fac) => (
                                                <tr key={fac._id} className="hover:bg-red-50/30 transition-colors group">
                                                    <td className="py-4 px-6 align-top font-bold text-gray-800 text-sm">{fac.fullName}</td>
                                                    <td className="py-4 px-6 align-top text-sm text-gray-700">{fac.email}</td>
                                                    <td className="py-4 px-6 align-top text-sm text-gray-700" style={{maxWidth: '260px', wordBreak: 'break-word', whiteSpace: 'normal'}}>
                                                        {fac.branch?.name || ''}
                                                    </td>
                                                    <td className="py-4 px-6 align-top text-sm text-gray-700">{fac.phoneNumber}</td>
                                                    <td className="py-4 px-6 align-top text-sm text-gray-700">{fac.role}</td>
                                                    <td className="py-4 px-6 align-top text-sm text-gray-700">{fac.designation}</td>
                                                    <td className="py-4 px-6 align-top text-sm text-gray-700">{fac.branch?.programType || ''}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="py-12 text-center text-gray-400">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <MdFilterList className="text-4xl mb-2 text-gray-300" />
                                                        <p>No faculty found.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default FacultyList;