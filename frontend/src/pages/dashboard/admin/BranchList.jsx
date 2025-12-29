import React, { useState, useMemo, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { 
  MdSearch, 
  MdFilterList, 
  MdEdit, 
  MdDelete, 
  MdRefresh,
  MdCheckCircle,
  MdCancel,
  MdArrowDropDown,
} from "react-icons/md";
import HeaderProfile from "../../../components/HeaderProfile";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import { getAllBranchesAsync } from "../../../store/slices/branchDomainSlice";

function BranchList() {
    // Dropdown open state for custom filters
    const [programTypeDropdownOpen, setProgramTypeDropdownOpen] = useState(false);
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
    const statusDropdownRef = useRef(null);
    const programTypeDropdownRef = useRef(null);
    // Close dropdowns on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (statusDropdownOpen && statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
                setStatusDropdownOpen(false);
            }
            if (programTypeDropdownOpen && programTypeDropdownRef.current && !programTypeDropdownRef.current.contains(event.target)) {
                setProgramTypeDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [statusDropdownOpen, programTypeDropdownOpen]);
    // Filter bar toggle for small screens
    const [showFilters, setShowFilters] = useState(false);
    const { allBranches = [] } = useAppSelector((state) => state.domainBranch || {});
    
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(getAllBranchesAsync());
    }, [dispatch]);

    // Helper to close all dropdowns
    const closeAllDropdowns = () => {
        setProgramTypeDropdownOpen(false);
        setStatusDropdownOpen(false);
    };

    // --- FILTER STATE ---
    const [filters, setFilters] = useState({
        search: "",
        status: "ALL", // Active/Inactive
        programType: "ALL" // Program type
    });

    // --- FILTER LOGIC ---
    const filteredBranches = useMemo(() => {
        return allBranches.filter(branch => {
            // 1. Search
            const matchesSearch = branch.name.toLowerCase().includes(filters.search.toLowerCase());
            // 2. Status (isActive)
            const matchesStatus = filters.status === "ALL" || (filters.status === "ACTIVE" ? branch.isActive : !branch.isActive);
            // 3. Program Type
            const matchesProgramType = filters.programType === "ALL" || branch.programType === filters.programType;
            return matchesSearch && matchesStatus && matchesProgramType;
        });
    }, [filters, allBranches]);

    // Calculate Active Filters Count
    const activeFilterCount = [
        filters.search !== "",
        filters.status !== "ALL",
        filters.programType !== "ALL"
    ].filter(Boolean).length;

    // --- HANDLERS ---
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const clearFilters = () => {
        setFilters({ search: "", status: "ALL", programType: "ALL" });
    };

    const getStatusBadge = (isActive) => {
        return isActive
            ? <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center gap-1 w-max"><MdCheckCircle /> ACTIVE</span>
            : <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold flex items-center gap-1 w-max"><MdCancel /> INACTIVE</span>;
    };

  return (
    <div className="flex bg-gradient-to-br from-gray-100 via-white to-gray-200 min-h-[calc(100vh-5rem)]">
      {/* Main Content */}
      <section className="w-full max-w-7xl mx-auto px-0 md:px-0 flex flex-col h-screen overflow-hidden">
        
        {/* Fixed Header Section */}
        <div className="flex-shrink-0 bg-white shadow-sm border-b border-gray-200 z-20">
            <div className="p-0">
                <HeaderProfile />
            </div>
            
            <div className="mt-8 px-0 md:px-8 pb-2">  
                {/* Page Title */}
                <h3 className="text-xl font-semibold !text-gray-700 mb-2 border-b pb-2 px-6 md:px-0">
                    All Branch
                </h3>
                <p className="text-sm text-gray-500 mb-6 px-6 md:px-0">
                    Manage recruitment partners, update seats, and monitor status.
                </p>

                {/* Filter Bar Toggle for small screens */}
                <div className="md:hidden flex justify-end mb-2 mr-2">
                    <button
                        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold shadow hover:bg-red-700 transition-colors"
                        onClick={() => setShowFilters((prev) => !prev)}
                    >
                        {showFilters ? 'Hide Filters' : 'Show Filters'}
                    </button>
                </div>
                <div className={`mt-6 bg-gray-50 border border-gray-200 rounded-xl mx-1 p-3 flex flex-col md:flex-row gap-3 items-center ${showFilters ? '' : 'hidden'} md:flex`} >
                    {/* Search Input */}
                    <div className="relative w-full max-w-xs">
                        <MdSearch className="absolute left-3 top-2.5 text-gray-400 text-lg" />
                        <input 
                            type="text" 
                            name="search"
                            value={filters.search}
                            onChange={handleFilterChange}
                            placeholder="Search branch..." 
                            className="w-full pl-10 pr-4 py-2 bg-white border border-red-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-500"
                        />
                    </div>
                    {/* Status Filter */}
                    <div className="relative w-full max-w-xs" ref={statusDropdownRef}>
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
                            {filters.status === 'ALL' ? 'All Status' : filters.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                            <MdArrowDropDown className="ml-2 text-gray-400" />
                        </button>
                        {statusDropdownOpen && (
                            <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                <button
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-red-50 hover:text-red-700 ${filters.status === 'ALL' ? 'font-bold text-red-600' : ''}`}
                                    onClick={() => { setFilters(f => ({ ...f, status: 'ALL' })); setStatusDropdownOpen(false); }}
                                >
                                    All Status
                                </button>
                                <button
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-red-50 hover:text-red-700 ${filters.status === 'ACTIVE' ? 'font-bold text-red-600' : ''}`}
                                    onClick={() => { setFilters(f => ({ ...f, status: 'ACTIVE' })); setStatusDropdownOpen(false); }}
                                >
                                    Active
                                </button>
                                <button
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-red-50 hover:text-red-700 ${filters.status === 'INACTIVE' ? 'font-bold text-red-600' : ''}`}
                                    onClick={() => { setFilters(f => ({ ...f, status: 'INACTIVE' })); setStatusDropdownOpen(false); }}
                                >
                                    Inactive
                                </button>
                            </div>
                        )}
                    </div>
                    {/* Program Type Filter */}
                    <div className="relative w-full max-w-xs" ref={programTypeDropdownRef}>
                        <button
                            type="button"
                            className={`w-full flex items-center justify-between px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-red-400 focus:outline-none focus:border-red-500 transition-colors ${programTypeDropdownOpen ? 'border-red-400' : ''}`}
                            onClick={() => {
                                if (!programTypeDropdownOpen) {
                                    closeAllDropdowns();
                                    setProgramTypeDropdownOpen(true);
                                } else {
                                    setProgramTypeDropdownOpen(false);
                                }
                            }}
                        >
                            {filters.programType === 'ALL' ? 'Program Type' : filters.programType}
                            <MdArrowDropDown className="ml-2 text-gray-400" />
                        </button>
                        {programTypeDropdownOpen && (
                            <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                <button
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-red-50 hover:text-red-700 ${filters.programType === 'ALL' ? 'font-bold text-red-600' : ''}`}
                                    onClick={() => { setFilters(f => ({ ...f, programType: 'ALL' })); setProgramTypeDropdownOpen(false); }}
                                >
                                    Program Type
                                </button>
                                {[...new Set(allBranches.map(b => b.programType))].map((type) => (
                                    <button
                                        key={type}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-red-50 hover:text-red-700 ${filters.programType === type ? 'font-bold text-red-600' : ''}`}
                                        onClick={() => { setFilters(f => ({ ...f, programType: type })); setProgramTypeDropdownOpen(false); }}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* Reset Button with Count */}
                    <button 
                        onClick={clearFilters}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-red-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-700 hover:border-red-500 transition-colors relative"
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

            {/* --- SCROLLABLE TABLE AREA --- */}
            <div className="flex-1 mx-1">
                {/* Result Count Top Right */}
                <div className="w-full flex justify-end">
                    <div className="font-bold text-red-600 text-sm mb-2 mr-1">
                        Showing {filteredBranches.length} result(s)
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
                    <div className="overflow-y-auto" style={{ maxHeight: "50vh" }}>
                        <table className="min-w-full text-left border-collapse">
                            <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200 shadow-sm">
                                <tr>
                                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Branch Name</th>
                                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Code</th>
                                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">College</th>
                                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Program Type</th>
                                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">HOD Name</th>
                                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">HOD Email</th>
                                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Created At</th>
                                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredBranches.length > 0 ? (
                                    filteredBranches.map((branch) => (
                                        <tr key={branch._id} className="hover:bg-red-50/30 transition-colors group">
                                            <td className="py-4 px-6 align-top">
                                                <div className="font-bold text-gray-800 text-sm">{branch.name}</div>
                                                <div className="text-xs text-gray-400 font-mono mt-1">ID: {branch._id}</div>
                                            </td>
                                            <td className="py-4 px-6 align-top">{branch.code}</td>
                                            <td className="py-4 px-6 align-top">{branch.college}</td>
                                            <td className="py-4 px-6 align-top">{branch.programType}</td>
                                            <td className="py-4 px-6 align-top">{branch.hodName}</td>
                                            <td className="py-4 px-6 align-top">{branch.hodEmail}</td>
                                            <td className="py-4 px-6 align-top">{getStatusBadge(branch.isActive)}</td>
                                            <td className="py-4 px-6 align-top">{new Date(branch.createdAt).toLocaleDateString()}</td>
                                            <td className="py-4 px-6 align-top text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Edit">
                                                        <MdEdit className="text-lg" />
                                                    </button>
                                                    <button className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete">
                                                        <MdDelete className="text-lg" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="9" className="py-12 text-center text-gray-400">
                                            <div className="flex flex-col items-center justify-center">
                                                <MdFilterList className="text-4xl mb-2 text-gray-300" />
                                                <p>No branches found matching your filters.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                {/* Result Count Footer removed as per new design */}
            </div>
        </div>
      </section>
    </div>
  );
}

export default BranchList;