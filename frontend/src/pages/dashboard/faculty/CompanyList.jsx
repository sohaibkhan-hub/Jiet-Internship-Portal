import React, { useState, useMemo, useEffect, useRef } from "react";
import { 
  MdSearch, 
  MdFilterList, 
  MdLocationOn,
  MdRefresh,
  MdCheckCircle,
  MdCheck,
  MdCancel,
  MdArrowDropDown,
} from "react-icons/md";
import HeaderProfile from "../../../components/HeaderProfile"; 
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import { getAllCompaniesAsync } from "../../../store/slices/companySlice";
import { getAllBranchesAsync, getAllDomainsAsync } from "../../../store/slices/branchDomainSlice";

function CompanyList() {
    // Dropdown open state for custom filters
    const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
    const [domainDropdownOpen, setDomainDropdownOpen] = useState(false);
    const statusDropdownRef = useRef(null);
    const domainDropdownRef = useRef(null);
    const branchDropdownRef = useRef(null);
    // Close dropdowns on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (statusDropdownOpen && statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
                setStatusDropdownOpen(false);
            }
            if (domainDropdownOpen && domainDropdownRef.current && !domainDropdownRef.current.contains(event.target)) {
                setDomainDropdownOpen(false);
            }
            if (branchDropdownOpen && branchDropdownRef.current && !branchDropdownRef.current.contains(event.target)) {
                setBranchDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [statusDropdownOpen, domainDropdownOpen, branchDropdownOpen]);
    const allCompanies = useAppSelector((state) => state.company.allCompanies);
    const allDomains = useAppSelector((state) => state.domainBranch.allDomains);
    const allBranches = useAppSelector((state) => state.domainBranch.allBranches);
    const dispatch = useAppDispatch();
    // Fetch companies on mount
    useEffect(() => {
        dispatch(getAllCompaniesAsync());
        dispatch(getAllBranchesAsync());
        dispatch(getAllDomainsAsync());
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
        status: "ALL",
        domain: "ALL",
        branch: "ALL", // Added Branch Filter
        city: ""
    });

    // --- FILTER LOGIC ---
    const filteredCompanies = useMemo(() => {
        return allCompanies.filter(company => {
            // 1. Search
            const matchesSearch = company.name.toLowerCase().includes(filters.search.toLowerCase());
            // 2. Status
            const matchesStatus = filters.status === "ALL" || company.recruitmentStatus === filters.status;
            // 3. Domain
            const matchesDomain = filters.domain === "ALL" || company.domainTags.some(d => d._id === filters.domain);
            // 4. Branch (New)
            const matchesBranch = filters.branch === "ALL" || company.allowedBranches.some(b => b._id === filters.branch);
            // 5. City
            const matchesCity = filters.city === "" || company.location.city.toLowerCase().includes(filters.city.toLowerCase());

            return matchesSearch && matchesStatus && matchesDomain && matchesBranch && matchesCity;
        });
    }, [filters, allCompanies]);

    // Calculate Active Filters Count
    const activeFilterCount = [
        filters.search !== "",
        filters.status !== "ALL",
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
        setFilters({ search: "", status: "ALL", domain: "ALL", branch: "ALL", city: "" });
    };

    const getStatusBadge = (status) => {
        switch (status) {
        case "OPEN": return <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center gap-1 w-max"><MdCheckCircle /> OPEN</span>;
        case "PAUSED": return <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold flex items-center gap-1 w-max"><MdCheck /> PAUSED</span>;
        case "CLOSED": return <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold flex items-center gap-1 w-max"><MdCancel /> CLOSED</span>;
        default: return null;
        }
    };

    // ...existing code...
    const [showFilters, setShowFilters] = React.useState(false);
    return (
    <div className="flex bg-gradient-to-br from-gray-100 via-white to-gray-200 md:min-h-[calc(100vh-5rem)]">
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
                    All Companies
                </h3>
                <p className="text-sm text-gray-500 mb-6 px-6 md:px-0">
                    Manage recruitment partners, update seats, and monitor status.
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
                    {/* Status Filter */}
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
                            {(() => {
                                switch (filters.status) {
                                    case 'OPEN': return 'Open';
                                    case 'PAUSED': return 'Paused';
                                    case 'CLOSED': return 'Closed';
                                    default: return 'All Status';
                                }
                            })()}
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
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-red-50 hover:text-red-700 ${filters.status === 'OPEN' ? 'font-bold text-red-600' : ''}`}
                                    onClick={() => { setFilters(f => ({ ...f, status: 'OPEN' })); setStatusDropdownOpen(false); }}
                                >
                                    Open
                                </button>
                                <button
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-red-50 hover:text-red-700 ${filters.status === 'PAUSED' ? 'font-bold text-red-600' : ''}`}
                                    onClick={() => { setFilters(f => ({ ...f, status: 'PAUSED' })); setStatusDropdownOpen(false); }}
                                >
                                    Paused
                                </button>
                                <button
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-red-50 hover:text-red-700 ${filters.status === 'CLOSED' ? 'font-bold text-red-600' : ''}`}
                                    onClick={() => { setFilters(f => ({ ...f, status: 'CLOSED' })); setStatusDropdownOpen(false); }}
                                >
                                    Closed
                                </button>
                            </div>
                        )}
                    </div>
                    {/* Domain Filter */}
                    <div className="relative md:col-span-2" style={{ minWidth: '180px', maxWidth: '320px' }} ref={domainDropdownRef}>
                        <button
                            type="button"
                            className={`w-full min-w-[180px] max-w-[320px] flex items-center justify-between px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-red-400 focus:outline-none focus:border-red-500 transition-colors ${domainDropdownOpen ? 'border-red-400' : ''}`}
                            onClick={() => {
                                if (!domainDropdownOpen) {
                                    closeAllDropdowns();
                                    setDomainDropdownOpen(true);
                                } else {
                                    setDomainDropdownOpen(false);
                                }
                            }}
                        >
                            <span
                                className="block truncate max-w-[240px]"
                                style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                            >
                                {filters.domain === 'ALL' ? 'Domains' : (allDomains.find(d => d._id === filters.domain)?.name || 'Domains')}
                            </span>
                            <MdArrowDropDown className="ml-2 text-gray-400" />
                        </button>
                        {domainDropdownOpen && (
                            <div className="absolute z-20 mt-1 min-w-[180px] max-w-[320px] w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                <button
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-red-50 hover:text-red-700 ${filters.domain === 'ALL' ? 'font-bold text-red-600' : ''}`}
                                    onClick={() => { setFilters(f => ({ ...f, domain: 'ALL' })); setDomainDropdownOpen(false); }}
                                >
                                    Domains
                                </button>
                                {allDomains.map((d) => (
                                    <button
                                        key={d._id}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-red-50 hover:text-red-700 ${filters.domain === d._id ? 'font-bold text-red-600' : ''}`}
                                        onClick={() => { setFilters(f => ({ ...f, domain: d._id })); setDomainDropdownOpen(false); }}
                                    >
                                        {d.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* Branch Filter (NEW) */}
                    <div className="relative md:col-span-2" style={{ minWidth: '180px', maxWidth: '360px' }} ref={branchDropdownRef}>
                        <button
                            type="button"
                            className={`w-full min-w-[180px] max-w-[360px] flex items-center justify-between px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-red-400 focus:outline-none focus:border-red-500 transition-colors ${branchDropdownOpen ? 'border-red-400' : ''}`}
                            onClick={() => {
                                if (!branchDropdownOpen) {
                                    closeAllDropdowns();
                                    setBranchDropdownOpen(true);
                                } else {
                                    setBranchDropdownOpen(false);
                                }
                            }}
                        >
                            <span
                                className="block truncate max-w-[240px]"
                                style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                            >
                                {filters.branch === 'ALL' ? 'Branches' : (allBranches.find(b => b._id === filters.branch)?.name || 'Branches')}
                            </span>
                            <MdArrowDropDown className="ml-2 text-gray-400" />
                        </button>
                        {branchDropdownOpen && (
                            <div className="absolute z-20 mt-1 min-w-[180px] max-w-[360px] w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                <button
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-red-50 hover:text-red-700 ${filters.branch === 'ALL' ? 'font-bold text-red-600' : ''}`}
                                    onClick={() => { setFilters(f => ({ ...f, branch: 'ALL' })); setBranchDropdownOpen(false); }}
                                >
                                    Branches
                                </button>
                                {allBranches.map((b) => (
                                    <button
                                        key={b._id}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-red-50 hover:text-red-700 ${filters.branch === b._id ? 'font-bold text-red-600' : ''}`}
                                        onClick={() => { setFilters(f => ({ ...f, branch: b._id })); setBranchDropdownOpen(false); }}
                                    >
                                        {b.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* Reset Button with Count */}
                    <div className="md:col-span-1 flex items-center w-full">
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
                        Showing {filteredCompanies.length} result(s)
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden min-w-[1200px]">
                    <div className="max-h-[53vh] overflow-y-auto w-full">
                        <table className="w-full text-left border-collapse">
                            {/* Sticky Header */}
                            <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200 shadow-sm">
                                <tr>
                                    <th className="py-2 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Company</th>
                                    <th className="py-2 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Location</th>
                                    {/* Separated Columns */}
                                    <th className="py-2 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Technical Domains</th>
                                    <th className="py-2 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Eligible Branches</th>
                                    {/* Updated Seats Header */}
                                    <th className="py-2 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Filled / Total</th>
                                    <th className="py-2 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Stipend</th>
                                    <th className="py-2 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    {/* <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th> */}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredCompanies.length > 0 ? (
                                    filteredCompanies.map((company) => {
                                        // Calculate percentage for seat bar
                                        const fillPercentage = Math.min((company.filledSeats / company.totalSeats) * 100, 100);
                                        const isFull = company.filledSeats >= company.totalSeats;

                                        return (
                                        <tr key={company._id} className="hover:bg-red-50/30 transition-colors group">
                                            {/* Company Name */}
                                            <td className="py-3 px-6 align-top">
                                                <div className="font-bold text-gray-800 text-sm">{company.name}</div>
                                                <div className="text-xs text-gray-400 font-mono mt-1">ID: {company._id}</div>
                                            </td>
                                            {/* Location */}
                                            <td className="py-3 px-6 align-top">
                                                <div className="flex items-start gap-1.5">
                                                    <MdLocationOn className="text-gray-400 mt-0.5 shrink-0" />
                                                    <div>
                                                        <div className="text-sm text-gray-700 font-medium">{company.location.city}</div>
                                                        <div className="text-xs text-gray-500">{company.location.state}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            {/* Domains (Separated) */}
                                            <td className="py-3 px-6 align-top">
                                                <div className="flex flex-wrap gap-1">
                                                    {company.domainTags.map((d, i) => (
                                                        <span key={i} className="px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 text-[10px] font-semibold rounded-md">
                                                            {d.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            {/* Branches (Separated) */}
                                            <td className="py-3 px-6 align-top">
                                                <div className="flex flex-wrap gap-1">
                                                    {company.allowedBranches.map((b, i) => (
                                                        <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-md border border-gray-200">
                                                            {b.code}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            {/* Seats (Filled / Total) */}
                                            <td className="py-3 px-6 align-top text-center w-32">
                                                <div className="flex flex-col items-center">
                                                    <div className="text-sm font-medium text-gray-700 mb-1">
                                                        <span className={isFull ? "text-green-600 font-bold" : "text-gray-900 font-bold"}>
                                                            {company.filledSeats}
                                                        </span>
                                                        <span className="text-gray-400 mx-1">/</span>
                                                        <span>{company.totalSeats}</span>
                                                    </div>
                                                    {/* Visual Progress Bar */}
                                                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full rounded-full ${isFull ? 'bg-green-500' : 'bg-blue-500'}`} 
                                                            style={{ width: `${fillPercentage}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            {/* Stipend */}
                                            <td className="py-3 px-6 align-top">
                                                <div className="text-sm font-semibold text-gray-700">
                                                    ₹{company.stipendAmount.toLocaleString()}
                                                </div>
                                                <div className="text-xs text-gray-400">/ month</div>
                                            </td>
                                            {/* Status */}
                                            <td className="py-3 px-6 align-top">
                                                {getStatusBadge(company.recruitmentStatus)}
                                            </td>
                                            {/* Actions */}
                                            {/* <td className="py-3 px-6 align-top text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Edit">
                                                        <MdEdit className="text-lg" />
                                                    </button>
                                                    <button className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete">
                                                        <MdDelete className="text-lg" />
                                                    </button>
                                                </div>
                                            </td> */}
                                        </tr>
                                    )})
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="py-12 text-center text-gray-400">
                                            <div className="flex flex-col items-center justify-center">
                                                <MdFilterList className="text-4xl mb-2 text-gray-300" />
                                                <p>No companies found matching your filters.</p>
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

export default CompanyList;