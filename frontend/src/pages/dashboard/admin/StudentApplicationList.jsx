import React, { useState, useMemo, useEffect } from "react";
import { MdSearch, MdFilterList, MdRefresh, MdArrowDropDown } from "react-icons/md";
import HeaderProfile from "../../../components/HeaderProfile";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import { getAllBranchesAsync, getAllDomainsAsync } from "../../../store/slices/branchDomainSlice";
import { getAllStudentApplicationDetailsAsync } from "../../../store/slices/adminSlice";

  // Collapse/expand for preferred domains (moved outside table/component)
function PreferredDomainsCollapse({ domains }) {
    const [expanded, setExpanded] = React.useState(false);
    if (!domains || domains.length === 0) return null;
    if (domains.length === 1) {
        return (
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-semibold rounded-md">{domains[0]}</span>
        );
    }
    return (
        <div className="flex flex-wrap gap-1">
            {!expanded ? (
                <>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-semibold rounded-md">{domains[0]}</span>
                    <button
                        className="px-2 py-0.5 bg-blue-100 text-blue-700 border border-blue-200 text-[10px] font-semibold rounded-md hover:bg-blue-200 focus:outline-none"
                        onClick={e => { e.stopPropagation(); setExpanded(true); }}
                        type="button"
                    >
                        +{domains.length - 1} more
                    </button>
                </>
            ) : (
                <>
                    {domains.map((d, i) => (
                        <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-semibold rounded-md">{d}</span>
                    ))}
                    <button
                        className="px-2 py-0.5 bg-blue-100 text-blue-700 border border-blue-200 text-[10px] font-semibold rounded-md hover:bg-blue-200 focus:outline-none"
                        onClick={e => { e.stopPropagation(); setExpanded(false); }}
                        type="button"
                    >
                        Show less
                    </button>
                </>
            )}
        </div>
    );
}

function StudentApplicationList() {
    // Dropdown open state for custom filters
    const [showFilters, setShowFilters] = React.useState(false);
    const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
    const [domainDropdownOpen, setDomainDropdownOpen] = useState(false);
    // --- Dropdown outside click using refs ---
    const branchDropdownRef = React.useRef(null);
    const statusDropdownRef = React.useRef(null);
    const domainDropdownRef = React.useRef(null);
    const allStudentApplicationDetails = useAppSelector((state) => state.admin.allStudentApplicationDetails || {});
    const { allDomains = [], allBranches = [] } = useAppSelector((state) => state.domainBranch || {});
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(getAllStudentApplicationDetailsAsync());
        dispatch(getAllDomainsAsync());
        dispatch(getAllBranchesAsync());
    }, [dispatch]);

    console.log("Student application", allStudentApplicationDetails);
    
    // Helper to close all dropdowns
    const closeAllDropdowns = () => {
        setBranchDropdownOpen(false);
        setStatusDropdownOpen(false);
        setDomainDropdownOpen(false);
    };

    useEffect(() => {
        function handleClickOutside(event) {
            if (branchDropdownOpen || statusDropdownOpen || domainDropdownOpen) {
                const refs = [branchDropdownRef, statusDropdownRef, domainDropdownRef];
                const clickedInside = refs.some(ref => ref.current && ref.current.contains(event.target));
                if (!clickedInside) {
                    closeAllDropdowns();
                }
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [branchDropdownOpen, statusDropdownOpen, domainDropdownOpen]);

  // --- FILTER STATE ---
    const [filters, setFilters] = useState({
        search: "",
        approvalStatus: "ALL",
        domain: "ALL",
        branch: "ALL",
        city: ""
    });

    // --- ACTUAL STUDENT APPLICATION DATA FROM API ---
    const STUDENT_APPLICATIONS = Array.isArray(allStudentApplicationDetails)
        ? allStudentApplicationDetails.map((item) => ({
            _id: item._id,
            student: {
                name: item.fullName,
                roll: item.rollNumber,
                branch: item.branch?.code || item.branch?.name || "-"
            },
            choices: Array.isArray(item.internshipData?.choices)
                ? item.internshipData.choices.map(choice => ({
                    company: choice.company?.name || "-",
                    domain: choice.domain?.name || "-",
                    location: choice.location || "-",
                    priority: choice.priority
                }))
                : [],
            status: item.internshipData?.approvalStatus || "PENDING",
            allocatedCompany: item.internshipData?.allocatedCompany?.name || null,
            approvalStatus: item.internshipData?.approvalStatus || "NOT_ALLOCATED",
            preferredDomains: Array.isArray(item.internshipData?.preferredDomains)
                ? item.internshipData.preferredDomains.map(d => d.name || d)
                : []
        }))
        : [];

    // --- FILTER LOGIC ---
    const filteredApplications = useMemo(() => {
        return STUDENT_APPLICATIONS.filter(app => {
            // 1. Search (by student name or roll)
            const matchesSearch =
                app.student.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                app.student.roll.toLowerCase().includes(filters.search.toLowerCase());
            // 2. Allocation Status
            const matchesAllocStatus = filters.approvalStatus === "ALL" || app.approvalStatus === filters.approvalStatus;
            // 3. Branch
            const matchesBranch = filters.branch === "ALL" || app.student.branch === filters.branch;
            // 4. Domain (any preferred domain matches)
            const matchesDomain = filters.domain === "ALL" || (app.preferredDomains && app.preferredDomains.includes(filters.domain));
            return matchesSearch && matchesAllocStatus && matchesBranch && matchesDomain;
        });
    }, [filters, STUDENT_APPLICATIONS]);

    // Get unique allocation statuses
    const uniqueAllocStatuses = useMemo(() => {
        const set = new Set(STUDENT_APPLICATIONS.map(app => app.approvalStatus));
        return Array.from(set);
    }, [STUDENT_APPLICATIONS]);


    // Calculate Active Filters Count
    const activeFilterCount = [
        filters.search !== "",
        filters.approvalStatus !== "ALL",
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
        setFilters({ search: "", approvalStatus: "ALL", domain: "ALL", branch: "ALL", city: "" });
    };

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
                        Student Applications
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
                    <div className={`mt-6 bg-gray-50 border border-gray-200 rounded-xl mx-1 p-3 grid grid-cols-1 md:grid-cols-6 gap-3 ${showFilters ? '' : 'hidden'} md:grid`} >
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
                        {/* Allocation Status Filter */}
                        <div className="md:col-span-1 relative">
                            <button
                                ref={statusDropdownRef}
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
                                {filters.approvalStatus === 'ALL' ? 'All Status' : filters.approvalStatus}
                                <MdArrowDropDown className="ml-2 text-gray-400" />
                            </button>
                            {statusDropdownOpen && (
                                <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto" onMouseDown={e => e.stopPropagation()}>
                                    <button
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-red-50 hover:text-red-700 ${filters.approvalStatus === 'ALL' ? 'font-bold text-red-600' : ''}`}
                                        onClick={() => { setFilters(f => ({ ...f, approvalStatus: 'ALL' })); setStatusDropdownOpen(false); }}
                                    >
                                        All Status
                                    </button>
                                    {uniqueAllocStatuses.map((status) => (
                                        <button
                                            key={status}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-red-50 hover:text-red-700 ${filters.approvalStatus === status ? 'font-bold text-red-600' : ''}`}
                                            onClick={() => { setFilters(f => ({ ...f, approvalStatus: status })); setStatusDropdownOpen(false); }}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        {/* Domain Filter */}
                        <div className="md:col-span-2 relative">
                            <button
                                ref={domainDropdownRef}
                                type="button"
                                className={`w-full flex items-center justify-between px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-red-400 focus:outline-none focus:border-red-500 transition-colors`}
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
                                <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto" onMouseDown={e => e.stopPropagation()}>
                                    <button
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-red-50 hover:text-red-700 ${filters.domain === 'ALL' ? 'font-bold text-red-600' : ''}`}
                                        onClick={() => { setFilters(f => ({ ...f, domain: 'ALL' })); setDomainDropdownOpen(false); }}
                                    >
                                        Domains
                                    </button>
                                    {allDomains.map((domain) => (
                                        <button
                                            key={domain.name}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-red-50 hover:text-red-700 ${filters.domain === domain.name ? 'font-bold text-red-600' : ''}`}
                                            onClick={() => { setFilters(f => ({ ...f, domain: domain.name })); setDomainDropdownOpen(false); }}
                                        >
                                            {domain.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        {/* Branch Filter (from student data) */}
                        <div className="md:col-span-2 relative">
                            <button
                                ref={branchDropdownRef}
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
                                {filters.branch === 'ALL' ? 'Branches' : filters.branch}
                                <MdArrowDropDown className="ml-2 text-gray-400" />
                            </button>
                            {branchDropdownOpen && (
                                <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto" onMouseDown={e => e.stopPropagation()}>
                                    <button
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-red-50 hover:text-red-700 ${filters.branch === 'ALL' ? 'font-bold text-red-600' : ''}`}
                                        onClick={() => { setFilters(f => ({ ...f, branch: 'ALL' })); setBranchDropdownOpen(false); }}
                                    >
                                        Branches
                                    </button>
                                    {allBranches.map((branch) => (
                                        <button
                                            key={branch.code || branch.name}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-red-50 hover:text-red-700 ${filters.branch === (branch.code || branch.name) ? 'font-bold text-red-600' : ''}`}
                                            onClick={() => { setFilters(f => ({ ...f, branch: branch.code || branch.name })); setBranchDropdownOpen(false); }}
                                        >
                                            {branch.name || branch.code}
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
                <div className="flex-1 overflow-auto mx-1">
                    {/* Result Count Top Right */}
                    <div className="w-full flex justify-end">
                        <div className="font-bold text-red-600 text-sm mb-2 mr-1">
                            Showing {filteredApplications.length} result(s)
                        </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl overflow-auto min-w-[1200px]">
                        <div className="max-h-[50vh] overflow-y-auto w-full">
                            <table className="w-full text-left border-collapse min-w-[1200px]">
                                <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200 shadow-sm">
                                    <tr>
                                        <th className="py-4 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Student</th>
                                        <th className="py-4 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Roll</th>
                                        <th className="py-4 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Branch</th>
                                        <th className="py-4 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Choice 1</th>
                                        <th className="py-4 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Choice 2</th>
                                        <th className="py-4 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Choice 3</th>
                                        <th className="py-4 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Choice 4</th>
                                        <th className="py-4 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Allocated Company</th>
                                        <th className="py-4 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Approval Status</th>
                                        <th className="py-4 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Preferred Domains</th>
                                        <th className="py-4 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredApplications.length > 0 ? (
                                        filteredApplications.map((app) => (
                                            <tr key={app._id} className="hover:bg-red-50/30 transition-colors group">
                                                <td className="py-4 px-3 align-top font-bold text-gray-800 text-sm min-w-[160px]">{app.student.name}</td>
                                                <td className="py-4 px-3 align-top text-sm text-gray-700">{app.student.roll}</td>
                                                <td className="py-4 px-3 align-top text-sm text-gray-700">{app.student.branch}</td>
                                                {app.choices.map((choice, idx) => (
                                                    <td key={idx} className="py-4 px-3 text-center align-top text-sm min-w-[200px]">
                                                        <div className="font-semibold text-gray-700 whitespace-normal break-words">{choice.company}</div>
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {Array.isArray(choice.domain)
                                                                ? choice.domain.map((d, i) => (
                                                                    <span key={i} className="px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 text-[10px] font-semibold rounded-md">
                                                                        {d.name || d}
                                                                    </span>
                                                                ))
                                                                : choice.domain && (
                                                                    <span className="px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 text-[10px] font-semibold rounded-md">
                                                                        {choice.domain}
                                                                    </span>
                                                                )}
                                                        </div>
                                                    </td>
                                                ))}
                                                {/* If less than 4 choices, fill empty cells */}
                                                {Array.from({ length: 4 - app.choices.length }).map((_, i) => (
                                                    <td key={"empty-" + i} className="py-4 px-3 align-top text-xs min-w-[160px]"></td>
                                                ))}
                                                <td className="py-4 px-3 align-top text-sm text-gray-700">{app.allocatedCompany || <span className="text-gray-400">-</span>}</td>
                                                <td className="py-4 px-3 align-top text-xs">
                                                    <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 font-semibold text-xs">{app.approvalStatus}</span>
                                                </td>
                                                <td className="py-4 px-3 align-top text-xs min-w-[150px]">
                                                    {app.preferredDomains && app.preferredDomains.length > 0 ? (
                                                        <PreferredDomainsCollapse domains={app.preferredDomains} />
                                                    ) : <span className="text-gray-400">-</span>}
                                                </td>
                                            
                                                <td className="py-4 px-3 align-top text-right">
                                                    <div className="flex flex-col items-center justify-end gap-3">
                                                        <button
                                                            className="px-3 py-1 bg-green-200 text-green-700 rounded hover:bg-green-400 !text-[14px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                            disabled={["APPROVED", "APPROVED_BY_TPO", "ALLOCATED"].includes(app.approvalStatus)}
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            className="px-4 py-1 bg-red-200 text-red-700 rounded hover:bg-red-400 !text-[14px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                            disabled={["APPROVED", "APPROVED_BY_TPO", "ALLOCATED"].includes(app.approvalStatus)}
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="11" className="py-12 text-center text-gray-400">
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
        </section>
        </div>
    );
}

export default StudentApplicationList;