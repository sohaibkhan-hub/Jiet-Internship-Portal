import React, { useState, useMemo, useEffect, useRef } from "react";
import { MdSearch, MdFilterList, MdRefresh, MdArrowDropDown } from "react-icons/md";
import HeaderProfile from "../../../components/HeaderProfile";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import { getAllStudentDetailsAsync } from "../../../store/slices/adminSlice";
import { getAllBranchesAsync, getAllDomainsAsync } from "../../../store/slices/branchDomainSlice";

function StudentList() {
    // Dropdown open state for custom filters
    const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
    const [domainDropdownOpen, setDomainDropdownOpen] = useState(false);
    const branchDropdownRef = useRef(null);
    const statusDropdownRef = useRef(null);
    const domainDropdownRef = useRef(null);
        // Close dropdowns on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (branchDropdownOpen && branchDropdownRef.current && !branchDropdownRef.current.contains(event.target)) {
                setBranchDropdownOpen(false);
            }
            if (statusDropdownOpen && statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
                setStatusDropdownOpen(false);
            }
            if (domainDropdownOpen && domainDropdownRef.current && !domainDropdownRef.current.contains(event.target)) {
                setDomainDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [branchDropdownOpen, statusDropdownOpen, domainDropdownOpen]);
    const allStudentsDetails = useAppSelector((state) => state.admin.allStudentsDetails || {});
    const { allDomains = [], allBranches = [] } = useAppSelector((state) => state.domainBranch || {});
        
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(getAllStudentDetailsAsync());
        dispatch(getAllDomainsAsync());
        dispatch(getAllBranchesAsync());
    }, [dispatch]);

    // Helper to close all dropdowns
    const closeAllDropdowns = () => {
        setBranchDropdownOpen(false);
        setStatusDropdownOpen(false);
        setDomainDropdownOpen(false);
    };

  // --- FILTER STATE ---
    const [filters, setFilters] = useState({
        search: "",
        year: "ALL",
        domain: "ALL",
        branch: "ALL",
        city: ""
    });

    // --- STUDENT DATA FROM API ---
    const STUDENT_APPLICATIONS = Array.isArray(allStudentsDetails) ? allStudentsDetails : [];

    // --- FILTER LOGIC ---
    const filteredApplications = useMemo(() => {
        return STUDENT_APPLICATIONS.filter(app => {
            // 1. Search (by fullName or rollNumber)
            const matchesSearch =
                (app.fullName && app.fullName.toLowerCase().includes(filters.search.toLowerCase())) ||
                (app.rollNumber && app.rollNumber.toLowerCase().includes(filters.search.toLowerCase()));
            // 2. Year
            const matchesYear = filters.year === "ALL" || app.year === filters.year;
            // 3. Branch
            const matchesBranch = filters.branch === "ALL" || (app.branch && app.branch.name === filters.branch);
            // 4. Domain (any preferred domain matches)
            const matchesDomain = filters.domain === "ALL" || (app.internshipData && app.internshipData.preferredDomains && app.internshipData.preferredDomains.includes(filters.domain));
            return matchesSearch && matchesYear && matchesBranch && matchesDomain;
        });
    }, [filters, STUDENT_APPLICATIONS]);

    // Use allBranches from API for branch filter
    const uniqueBranches = useMemo(() => {
        return allBranches.map(branch => branch.name);
    }, [allBranches]);

    // Get unique years
    const uniqueYears = useMemo(() => {
        const set = new Set(STUDENT_APPLICATIONS.map(app => app.year));
        set.delete(undefined);
        return Array.from(set);
    }, [STUDENT_APPLICATIONS]);

    // Use allDomains from API for domain filter
    const uniqueDomains = useMemo(() => {
        return allDomains.map(domain => domain.name);
    }, [allDomains]);

  // Calculate Active Filters Count
    const activeFilterCount = [
        filters.search !== "",
        filters.year !== "ALL",
        filters.domain !== "ALL",
        filters.branch !== "ALL",
        filters.city !== ""
    ].filter(Boolean).length;

    // --- HANDLERS ---
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const clearFilters = () => {
        setFilters({ search: "", year: "ALL", domain: "ALL", branch: "ALL", city: "" });
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
                            Student Lists
                        </h3>
                        <p className="text-sm text-gray-500 mb-6 px-6 md:px-0">
                            Review and take action on student internship applications.
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
                            <div className="md:col-span-1 relative">
                                <MdSearch className="absolute left-3 top-2.5 text-gray-400 text-lg" />
                                <input 
                                    type="text" 
                                    name="search"
                                    value={filters.search}
                                    onChange={handleFilterChange}
                                    placeholder="Search company..." 
                                    className="w-full pl-10 pr-4 py-2 bg-white border border-red-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-500"
                                />
                            </div>
                            {/* Year Filter */}
                            <div className="relative md:col-span-1" ref={statusDropdownRef}>
                                <button
                                    type="button"
                                    className={`w-full flex items-center justify-between px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-red-400 focus:outline-none focus:border-red-500 transition-colors ${statusDropdownOpen ? 'border-red-400' : ''}`}
                                    onClick={() => {
                                        if (!statusDropdownOpen) {
                                            closeAllDropdowns();
                                            setStatusDropdownOpen(true);
                                        } else {
                                            setStatusDropdownOpen(false);
                                        }
                                    }}
                                >
                                    {filters.year === 'ALL' ? 'All Years' : filters.year}
                                    <MdArrowDropDown className="ml-2 text-gray-400" />
                                </button>
                                {statusDropdownOpen && (
                                    <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                        <button
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-red-50 hover:text-red-700 ${filters.year === 'ALL' ? 'font-bold text-red-600' : ''}`}
                                            onClick={() => { setFilters(f => ({ ...f, year: 'ALL' })); setStatusDropdownOpen(false); }}
                                        >
                                            All Years
                                        </button>
                                        {uniqueYears.map((year) => (
                                            <button
                                                key={year}
                                                className={`w-full text-left px-4 py-2 text-sm hover:bg-red-50 hover:text-red-700 ${filters.year === year ? 'font-bold text-red-600' : ''}`}
                                                onClick={() => { setFilters(f => ({ ...f, year: year })); setStatusDropdownOpen(false); }}
                                            >
                                                {year}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {/* Domain Filter */}
                            <div className="relative md:col-span-2" style={{ minWidth: '220px', maxWidth: '360px' }} ref={domainDropdownRef}>
                                <button
                                    type="button"
                                    className={`w-full min-w-[260px] max-w-[420px] flex items-center justify-between px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-red-400 focus:outline-none focus:border-red-500 transition-colors`}
                                    onClick={() => {
                                        if (!domainDropdownOpen) {
                                            closeAllDropdowns();
                                            setDomainDropdownOpen(true);
                                        } else {
                                            setDomainDropdownOpen(false);
                                        }
                                    }}
                                >
                                    {filters.domain === 'ALL' ? 'Domains' : filters.domain}
                                    <MdArrowDropDown className="ml-2 text-gray-400" />
                                </button>
                                {domainDropdownOpen && (
                                    <div className="absolute z-20 mt-1 min-w-[260px] max-w-[420px] w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                        <button
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-red-50 hover:text-red-700 ${filters.domain === 'ALL' ? 'font-bold text-red-600' : ''}`}
                                            onClick={() => { setFilters(f => ({ ...f, domain: 'ALL' })); setDomainDropdownOpen(false); }}
                                        >
                                            Domains
                                        </button>
                                        {uniqueDomains.map((d) => (
                                            <button
                                                key={d}
                                                className={`w-full text-left px-4 py-2 text-sm hover:bg-red-50 hover:text-red-700 ${filters.domain === d ? 'font-bold text-red-600' : ''}`}
                                                onClick={() => { setFilters(f => ({ ...f, domain: d })); setDomainDropdownOpen(false); }}
                                            >
                                                {d}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {/* Domain Filter removed (no domain data available) */}
                            {/* Branch Filter (from student data) */}
                            <div className="relative md:col-span-2" style={{ minWidth: '220px', maxWidth: '320px' }} ref={branchDropdownRef}>
                                <button
                                    type="button"
                                    className={`w-full min-w-[260px] max-w-[360px] flex items-center justify-between px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-red-400 focus:outline-none focus:border-red-500 transition-colors ${branchDropdownOpen ? 'border-red-400' : ''}`}
                                    onClick={() => {
                                        if (!branchDropdownOpen) {
                                            closeAllDropdowns();
                                            setBranchDropdownOpen(true);
                                        } else {
                                            setBranchDropdownOpen(false);
                                        }
                                    }}
                                >
                                    {filters.branch === 'ALL' ? 'Branches' : filters.branch}
                                    <MdArrowDropDown className="ml-2 text-gray-400" />
                                </button>
                                {branchDropdownOpen && (
                                    <div className="absolute z-20 mt-1 min-w-[260px] max-w-[360px] w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                        <button
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-red-50 hover:text-red-700 ${filters.branch === 'ALL' ? 'font-bold text-red-600' : ''}`}
                                            onClick={() => { setFilters(f => ({ ...f, branch: 'ALL' })); setBranchDropdownOpen(false); }}
                                        >
                                            Branches
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
                            {/* Reset Button with Count */}
                            <div className="md:col-span-1 flex items-center">
                                <button 
                                    onClick={clearFilters}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-red-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-700 hover:border-red-500 transition-colors relative w-full"
                                >
                                    <MdRefresh /> Reset
                                    {activeFilterCount > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                                            {activeFilterCount}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* --- SCROLLABLE TABLE AREA --- */}
                    <div className="flex-1 overflow-auto mx-1">
                        {/* Result Count Top Right */}
                        <div className="w-full flex justify-end">
                            <div className="font-bold text-red-600 text-sm mb-2 mr-1">
                                Showing {filteredApplications.length} result(s)
                            </div>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl">
                            <div className="w-full overflow-x-auto">
                                <div className="max-h-[50vh] overflow-y-auto w-full">
                                    <table className="min-w-[1200px] w-max text-left border-collapse">
                                    <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200 shadow-sm">
                                        <tr>
                                            <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Student Name</th>
                                            <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                                            <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Year</th>
                                            <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Roll Number</th>
                                            <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Branch</th>
                                            <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Father Name</th>
                                            <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">DOB</th>
                                            <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Phone No.</th>
                                            {/* Action column removed */}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredApplications.length > 0 ? (
                                            filteredApplications.map((app) => (
                                                <tr key={app._id} className="hover:bg-red-50/30 transition-colors group">
                                                    <td className="py-4 px-6 align-top font-bold text-gray-800 text-sm">{app.fullName}</td>
                                                    <td className="py-4 px-6 align-top text-sm text-gray-700">{app.email}</td>
                                                    <td className="py-4 px-6 align-top text-sm text-gray-700">{app.year}</td>
                                                    <td className="py-4 px-6 align-top text-sm text-gray-700">{app.rollNumber}</td>
                                                    <td className="py-4 px-6 align-top text-sm text-gray-700">{app.branch.code}</td>
                                                    <td className="py-4 px-6 align-top text-sm text-gray-700">{app.fatherName}</td>
                                                    <td className="py-4 px-6 align-top text-sm text-gray-700">{app.dateOfBirth}</td>
                                                    <td className="py-4 px-6 align-top text-sm text-gray-700">{app.phoneNumber}</td>
                                                    {/* Action column removed */}
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="9" className="py-12 text-center text-gray-400">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <MdFilterList className="text-4xl mb-2 text-gray-300" />
                                                        <p>No student applications found matching your filters.</p>
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

export default StudentList;