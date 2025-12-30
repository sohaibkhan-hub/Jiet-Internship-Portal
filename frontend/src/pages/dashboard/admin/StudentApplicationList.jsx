import React, { useState, useMemo, useEffect } from "react";
import { MdSearch, MdFilterList, MdRefresh, MdArrowDropDown } from "react-icons/md";
import HeaderProfile from "../../../components/HeaderProfile";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import { getAllBranchesAsync, getAllDomainsAsync } from "../../../store/slices/branchDomainSlice";
import { getAllStudentApplicationDetailsAsync, allocateCompanyAsync, rejectApplicationAsync } from "../../../store/slices/adminSlice";
import { toast } from "react-toastify";

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
    const [rejectPopup, setRejectPopup] = useState({ open: false, appId: null });
    const [rejectReason, setRejectReason] = useState("");
    // Dropdown open state for custom filters
    const [showFilters, setShowFilters] = React.useState(false);
    const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
    const [domainDropdownOpen, setDomainDropdownOpen] = useState(false);
    // --- Dropdown outside click using refs ---
    const branchDropdownRef = React.useRef(null);
    const statusDropdownRef = React.useRef(null);
    const domainDropdownRef = React.useRef(null);
    const [localApprovalStatus, setLocalApprovalStatus] = useState({});
    const [loadingActions, setLoadingActions] = useState({});
    const allStudentApplicationDetails = useAppSelector((state) => state.admin.allStudentApplicationDetails || {});
    const { allDomains = [], allBranches = [] } = useAppSelector((state) => state.domainBranch || {});
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(getAllStudentApplicationDetailsAsync());
        dispatch(getAllDomainsAsync());
        dispatch(getAllBranchesAsync());
    }, [dispatch]);

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
                branch: item.branch?.code || item.branch?.name || "-",
                email: item.email || (item.user?.email) || ""
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

    const handleApprovedApplication = async (studentId) => {
        try {
            setLoadingActions(prev => ({ ...prev, [studentId]: true }));
            
            // Optimistically update UI
            setLocalApprovalStatus(prev => ({
                ...prev,
                [studentId]: "APPROVED"
            }));
            if(!studentId){
                toast.error("Student ID is missing");
                return;
            }
            // Call API
            const response = await dispatch(allocateCompanyAsync({ studentId })).unwrap();
            
            if (response.success === true || response.statusCode === 200) {
                await dispatch(getAllStudentApplicationDetailsAsync());
                toast.success(response.message || "Company allocated successfully!");
            } else {
                toast.error(response.message || "Failed to allocate company.");
            }
            
        } catch (error) {
            toast.error(error.message || "Failed to approve application:");
            setLocalApprovalStatus(prev => {
                const newStatus = { ...prev };
                delete newStatus[studentId];
                return newStatus;
            });
        } finally {
            setLoadingActions(prev => ({ ...prev, [studentId]: false }));
        }
    };

    const handleRejectApplication = async (studentId, reason) => {
        try {
            setLoadingActions(prev => ({ ...prev, [studentId]: true }));
            
            // Optimistically update UI
            setLocalApprovalStatus(prev => ({
                ...prev,
                [studentId]: "REJECTED"
            }));

            if(!studentId || !reason){
                toast.error("Student ID or reason is missing");
                return;
            }

            // Call API
            const response = await dispatch(rejectApplicationAsync({ studentId, reason })).unwrap();
            
            if (response.success === true || response.statusCode === 200) {
                await dispatch(getAllStudentApplicationDetailsAsync());
                toast.success(response.message || "Application rejected successfully!");
            } else {
                toast.error(response.message || "Failed to reject application.");
            }
        } catch (error) {
            toast.error(error.message || "Failed to reject application.");
            // Revert optimistic update on error
            setLocalApprovalStatus(prev => {
                const newStatus = { ...prev };
                delete newStatus[studentId];
                return newStatus;
            });
        } finally {
            setLoadingActions(prev => ({ ...prev, [studentId]: false }));
        }
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
                    <div className={`mt-6 bg-gray-50 border border-gray-200 rounded-xl mx-1 p-3 ${showFilters ? '' : 'hidden'} md:flex md:items-center md:gap-3`} >
                        {/* Search Input */}
                        <div className="relative md:w-48 flex-shrink-0">
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
                        <div className="relative md:w-40 flex-shrink-0">
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
                        <div className="relative md:w-56 flex-shrink-0">
                            <button
                                ref={domainDropdownRef}
                                type="button"
                                style={{ minWidth: '220px', maxWidth: '360px' }}
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
                        <div className="relative md:w-56 flex-shrink-0">
                            <button
                                ref={branchDropdownRef}
                                type="button"
                                style={{ minWidth: '220px', maxWidth: '360px' }}
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
                                            key={branch.name}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-red-50 hover:text-red-700 ${filters.branch === (branch.name) ? 'font-bold text-red-600' : ''}`}
                                            onClick={() => { setFilters(f => ({ ...f, branch: branch.name })); setBranchDropdownOpen(false); }}
                                        >
                                            {branch.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        {/* Reset Button with Count */}
                        <div className="flex items-center md:ml-2 relative">
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
                        <div className="overflow-y-auto" style={{ maxHeight: "50vh" }}>
                            <table className="min-w-full text-left border-collapse">
                                <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200 shadow-sm">
                                    <tr>
                                        <th className="py-2 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Student</th>
                                        <th className="py-2 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Roll</th>
                                        <th className="py-2 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Branch</th>
                                        <th className="py-2 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Choice 1</th>
                                        <th className="py-2 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Choice 2</th>
                                        <th className="py-2 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Choice 3</th>
                                        <th className="py-2 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Choice 4</th>
                                        <th className="py-2 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Allocated Company</th>
                                        <th className="py-2 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Approval Status</th>
                                        <th className="py-2 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Preferred Domains</th>
                                        <th className="py-2 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredApplications.length > 0 ? (
                                        filteredApplications.map((app) => (
                                            <tr key={app._id} className="hover:bg-red-50/30 transition-colors group">
                                                <td className="py-2 px-3 align-center font-bold text-gray-800 text-sm min-w-[160px]">{app.student.name}</td>
                                                <td className="py-2 px-3 align-center text-sm text-gray-700">{app.student.roll}</td>
                                                <td className="py-2 px-3 align-center text-sm text-gray-700">{app.student.branch}</td>
                                                {app.choices.map((choice, idx) => (
                                                    <td key={idx} className="py-2 px-3 text-sm min-w-[200px]">
                                                        <div className="font-semibold text-gray-700 whitespace-normal break-words text-center">{choice.company}</div>
                                                        <div className="flex flex-wrap gap-1 mt-1 justify-center">
                                                            {Array.isArray(choice.domain)
                                                                ? choice.domain.map((d, i) => (
                                                                    <span key={i} className="px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 text-[10px] font-semibold rounded-md">
                                                                        {d.name || d}
                                                                    </span>
                                                                ))
                                                                : choice.domain && (
                                                                    <span className="px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 text-[10px] font-semibold rounded-md text-center">
                                                                        {choice.domain}
                                                                    </span>
                                                                )}
                                                        </div>
                                                    </td>
                                                ))}
                                                {/* If less than 4 choices, fill empty cells */}
                                                {Array.from({ length: 4 - app.choices.length }).map((_, i) => (
                                                    <td key={"empty-" + i} className="py-2 px-3 align-top text-xs min-w-[160px]"></td>
                                                ))}
                                                <td className="py-2 px-3 align-center text-sm text-gray-700 font-semibold">{app.allocatedCompany || <span className="text-gray-400">-</span>}</td>
                                                <td className="py-2 px-3 align-center text-xs">
                                                    <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 font-semibold !text-xs">{app.approvalStatus}</span>
                                                </td>
                                                <td className="py-2 px-3 align-top text-xs min-w-[150px]">
                                                    {app.preferredDomains && app.preferredDomains.length > 0 ? (
                                                        <PreferredDomainsCollapse domains={app.preferredDomains} />
                                                    ) : <span className="text-gray-400">-</span>}
                                                </td>
                                            
                                                <td className="py-2 px-3 align-center text-right">
                                                    <div className="flex flex-row items-center justify-end gap-2">
                                                        {/* Use local status for testing, fallback to API status */}
                                                        {(() => {
                                                            const currentStatus = localApprovalStatus[app._id] || app.approvalStatus;
                                                            
                                                            if (["APPROVED", "APPROVED_BY_TPO", "ALLOCATED"].includes(currentStatus)) {
                                                                return (
                                                                    <button
                                                                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-100 border border-green-200 text-green-700 rounded-md font-semibold !text-xs cursor-not-allowed"
                                                                        disabled
                                                                    >
                                                                        <span className="text-sm">✓</span> Approved
                                                                    </button>
                                                                );
                                                            } else if (currentStatus === "REJECTED") {
                                                                return (
                                                                    <button
                                                                        className="flex items-center gap-1 px-2.5 py-1 bg-red-50 border border-red-200 text-red-600 !rounded-lg font-semibold !text-xs cursor-not-allowed"
                                                                        disabled
                                                                    >
                                                                        <span className="text-sm">✖</span> Rejected
                                                                    </button>
                                                                );
                                                            } else {
                                                                return (
                                                                    <>
                                                                        <button
                                                                            onClick={() => {
                                                                                setRejectPopup({ open: true, appId: app._id });
                                                                                setRejectReason("");
                                                                            }}
                                                                            className="flex items-center justify-center w-5 h-5 !rounded-sm bg-white border-2 border-red-400 text-red-600 rounded-md hover:!bg-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                            title="Reject"
                                                                            disabled={loadingActions[app._id]}
                                                                        >
                                                                            {loadingActions[app._id] ? (
                                                                                <span className="animate-spin">⏳</span>
                                                                            ) : (
                                                                                <span className="p-1">✖</span>
                                                                            )}
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleApprovedApplication(app._id)}
                                                                            className="flex items-center !rounded-xl gap-1 px-2.5 bg-green-200 text-black rounded-md font-semibold !text-xs hover:bg-green-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                            disabled={loadingActions[app._id]}
                                                                        >
                                                                            {loadingActions[app._id] ? (
                                                                                <span className="animate-spin">⏳</span>
                                                                            ) : (
                                                                                <>
                                                                                    <span className="text-lg">✓</span> Approve
                                                                                </>
                                                                            )}
                                                                        </button>
                                                                    </>
                                                                );
                                                            }
                                                        })()}
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
        {/* Reject Reason Popup */}
        {rejectPopup.open && (
            <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
                    <div className="mb-4">
                        <svg className="w-12 h-12 mx-auto text-red-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12l2.5 2.5L16 9" />
                        </svg>
                    </div>
                    <div className="text-lg font-semibold text-gray-800 mb-2">Reject Application</div>
                    <div className="text-gray-500 text-sm mb-4">Please provide a reason for rejecting this application. This will be visible to the student.</div>
                    <textarea
                        className="w-full border border-gray-300 rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-red-200 text-gray-700"
                        rows={3}
                        value={rejectReason}
                        onChange={e => setRejectReason(e.target.value)}
                        placeholder="Enter reason..."
                        autoFocus
                    />
                    <div className="flex justify-center gap-4">
                        <button
                            className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                            onClick={() => setRejectPopup({ open: false, appId: null })}
                        >
                            Cancel
                        </button>
                        <button
                            className="px-5 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 shadow-sm transition-colors disabled:opacity-50"
                            disabled={!rejectReason.trim()}
                            onClick={() => {
                                handleRejectApplication(rejectPopup.appId, rejectReason);
                                setRejectPopup({ open: false, appId: null });
                                setRejectReason("");
                            }}
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        )}
        </div>
    );
}

export default StudentApplicationList;