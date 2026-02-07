import React, { useState, useMemo, useEffect } from "react";
import { MdSearch, MdFilterList, MdRefresh, MdArrowDropDown, MdFileDownload } from "react-icons/md";
import HeaderProfile from "../../../components/HeaderProfile";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import { getAllBranchesAsync, getAllDomainsAsync } from "../../../store/slices/branchDomainSlice";
import { getAllCompaniesAsync } from "../../../store/slices/companySlice";
import { getAllStudentApplicationDetailsAsync, allocateCompanyAsync, rejectApplicationAsync, downloadCompanyStudentsAsync, downloadAllCompanyStudentsAsync, setAdminLoading } from "../../../store/slices/adminSlice";
import { toast } from "react-toastify";
import { adminService } from "../../../services/adminService";
import { studentService } from "../../../services/studentService";

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
    const [approvePopup, setApprovePopup] = useState({ open: false, app: null, companyId: "" });
    const [confirmApprovePopup, setConfirmApprovePopup] = useState({ open: false, app: null, companyId: "" });
    // Dropdown open state for custom filters
    const [showFilters, setShowFilters] = React.useState(false);
    const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
    const [domainDropdownOpen, setDomainDropdownOpen] = useState(false);
    const [downloadPopupOpen, setDownloadPopupOpen] = useState(false);
    const [companySearch, setCompanySearch] = useState("");
    const [selectedCompanyId, setSelectedCompanyId] = useState("");
    const [downloadType, setDownloadType] = useState("all");
    const [downloadMode, setDownloadMode] = useState("company");
    const [allDownloadType, setAllDownloadType] = useState("alloted");
    const [downloading, setDownloading] = useState(false);
    // --- Dropdown outside click using refs ---
    const branchDropdownRef = React.useRef(null);
    const statusDropdownRef = React.useRef(null);
    const domainDropdownRef = React.useRef(null);
    const [localApprovalStatus, setLocalApprovalStatus] = useState({});
    const [loadingActions, setLoadingActions] = useState({});
    const allStudentApplicationDetails = useAppSelector((state) => state.admin.allStudentApplicationDetails || {});
    const { allDomains = [], allBranches = [] } = useAppSelector((state) => state.domainBranch || {});
    const allCompanies = useAppSelector((state) => state.company.allCompanies || []);
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(getAllStudentApplicationDetailsAsync());
        dispatch(getAllDomainsAsync());
        dispatch(getAllBranchesAsync());
        dispatch(getAllCompaniesAsync());
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
                    companyId: choice.company?._id || null,
                    domain: choice.domain?.name || "-",
                    location: choice.location || "-",
                    priority: choice.priority,
                    resume: choice.resume || ""
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

    const filteredCompanies = useMemo(() => {
        const q = companySearch.trim().toLowerCase();
        if (!q) return allCompanies;
        return allCompanies.filter((c) => (c?.name || "").toLowerCase().includes(q));
    }, [allCompanies, companySearch]);

    const handleDownloadCompanyList = async () => {
        if (!selectedCompanyId) {
            toast.error("Please select a company");
            return;
        }
        try {
            setDownloading(true);
            const blob = await dispatch(
                downloadCompanyStudentsAsync({ companyId: selectedCompanyId, type: downloadType })
            ).unwrap();
            if (blob && blob.type && blob.type.includes("application/json")) {
                const text = await blob.text();
                let message = "Failed to download file";
                try {
                    const json = JSON.parse(text);
                    message = json?.message || message;
                } catch {
                    message = text || message;
                }
                throw new Error(message);
            }
            const selectedCompany = allCompanies.find((c) => c._id === selectedCompanyId);
            const safeName = (selectedCompany?.name || "company")
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "_")
                .replace(/^_+|_+$/g, "");
            const typeSuffix = downloadType === "all" ? "all" : downloadType;
            const filename = `${safeName || "company"}_${typeSuffix}_students.xlsx`;
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success("Excel file downloaded");
            setDownloadPopupOpen(false);
        } catch (err) {
            toast.error(typeof err === "string" ? err : err?.message || "Failed to download file");
        } finally {
            setDownloading(false);
        }
    };

    const handleDownloadAllCompanyList = async () => {
        try {
            setDownloading(true);
            const blob = await dispatch(downloadAllCompanyStudentsAsync({ type: allDownloadType })).unwrap();
            if (blob && blob.type && blob.type.includes("application/json")) {
                const text = await blob.text();
                let message = "Failed to download file";
                try {
                    const json = JSON.parse(text);
                    message = json?.message || message;
                } catch {
                    message = text || message;
                }
                throw new Error(message);
            }
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute(
                "download",
                `all_company_${allDownloadType === "alloted" ? "alloted" : "unalloted"}_students.xlsx`
            );
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success("Excel file downloaded");
            setDownloadPopupOpen(false);
        } catch (err) {
            toast.error(typeof err === "string" ? err : err?.message || "Failed to download file");
        } finally {
            setDownloading(false);
        }
    };

    const handleGenerateTrainingLetter = async (studentId, studentName) => {
        try {
            dispatch(setAdminLoading(true));
            const blob = await studentService.downloadTrainingLetter(studentId);
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement("a");
            link.href = url;
            const safeName = (studentName || "student")
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "_")
                .replace(/^_+|_+$/g, "");
            link.setAttribute("download", `${safeName}_training_letter.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            toast.error(typeof err === "string" ? err : err?.message || "Failed to download training letter");
        } finally {
            dispatch(setAdminLoading(false));
        }
    };

    const handleApprovedApplication = async (studentId, companyId) => {
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
            if(!companyId){
                toast.error("Company is missing");
                return;
            }
            // Call API
            const response = await dispatch(allocateCompanyAsync({ studentId, companyId })).unwrap();
            
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
                        <div className="flex items-center gap-4 md:ml-2 relative">
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

                            <button
                                onClick={() => {
                                    setCompanySearch("");
                                    setSelectedCompanyId("");
                                    setDownloadType("all");
                                    setDownloadMode("company");
                                    setAllDownloadType("alloted");
                                    setDownloadPopupOpen(true);
                                }}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500 border border-red-300 rounded-lg text-sm font-medium text-white hover:bg-red-600 hover:border-red-500 transition-colors relative"
                            >
                                <MdFileDownload className="h-6 w-6" /> List
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
                                        <th className="py-2 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Download</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredApplications.length > 0 ? (
                                        filteredApplications.map((app) => (
                                            <tr key={app._id} className={`transition-colors group ${app.allocatedCompany ? "bg-green-50/150 hover:bg-green-50/80" : "hover:bg-red-50/30"}`}>
                                                <td className="py-2 px-3 align-center font-bold text-gray-800 text-sm min-w-[160px]">{app.student.name}</td>
                                                <td className="py-2 px-3 align-center text-sm text-gray-700">{app.student.roll}</td>
                                                <td className="py-2 px-3 align-center text-sm text-gray-700">{app.student.branch}</td>
                                                {app.choices.map((choice, idx) => (
                                                    <td key={idx} className={`py-2 px-3 text-sm min-w-[220px] ${app.allocatedCompany && app.allocatedCompany === choice.company ? "bg-green-100/60" : ""}`}>
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
                                                        <div className="text-[10px] mt-1 text-center">
                                                            {choice.resume ? (
                                                                <div className="flex items-center justify-center gap-2">
                                                                    <a
                                                                        href={choice.resume}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="text-blue-600 hover:underline"
                                                                    >
                                                                        View
                                                                    </a>
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-400">No resume</span>
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
                                                                            onClick={() => {
                                                                                const choiceCompanies = Array.isArray(app.choices) ? app.choices : [];
                                                                                const selectable = choiceCompanies.filter(c => c.companyId);
                                                                                if (!selectable.length) {
                                                                                    toast.error("No valid company choices found for this student.");
                                                                                    return;
                                                                                }
                                                                                setApprovePopup({ open: true, app, companyId: "" });
                                                                            }}
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
                                                <td className="py-2 px-3 align-center text-right">
                                                    <button
                                                        className={`flex items-center h-9 gap-2 px-1 py-2 rounded shadow transition-colors ${
                                                            app.allocatedCompany ? "bg-red-500 text-white hover:bg-red-700" : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                                        }`}
                                                        onClick={() => app.allocatedCompany && handleGenerateTrainingLetter(app._id, app.student.name)}
                                                        disabled={!app.allocatedCompany}
                                                    >
                                                        {/* SVG Icon: Document with Download Arrow */}
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-8m0 8l-3-3m3 3l3-3M6 20.25h12a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v12a2.25 2.25 0 002.25 2.25z" />
                                                        </svg>
                                                        Generate
                                                    </button>
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





        
        {/* Approve Choice Popup */}
        {approvePopup.open && approvePopup.app && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 max-w-md w-full text-center">
                    <div className="text-lg font-semibold text-gray-800 mb-2">Select Company</div>
                    <div className="text-gray-500 text-sm mb-4">Choose one of the student's 4 preferences.</div>
                    <div className="mb-4">
                        <select
                            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-200 text-gray-700"
                            value={approvePopup.companyId}
                            onChange={(e) => setApprovePopup(prev => ({ ...prev, companyId: e.target.value }))}
                        >
                            <option value="">Select company...</option>
                            {approvePopup.app.choices.filter(c => c.companyId).map((c, idx) => (
                                <option key={`${approvePopup.app._id}-${idx}`} value={c.companyId}>
                                    {c.company}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-center gap-4">
                        <button
                            className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                            onClick={() => setApprovePopup({ open: false, app: null, companyId: "" })}
                        >
                            Cancel
                        </button>
                        <button
                            className="px-5 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 shadow-sm transition-colors disabled:opacity-50"
                            disabled={!approvePopup.companyId}
                            onClick={() => {
                                setConfirmApprovePopup({
                                    open: true,
                                    app: approvePopup.app,
                                    companyId: approvePopup.companyId
                                });
                                setApprovePopup({ open: false, app: null, companyId: "" });
                            }}
                        >
                            Continue
                        </button>
                    </div>
                </div>
            </div>
        )}
        {/* Approve Confirmation Popup */}
        {confirmApprovePopup.open && confirmApprovePopup.app && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 max-w-md w-full text-center">
                    <div className="mb-4">
                        <svg className="w-12 h-12 mx-auto text-red-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12l2.5 2.5L16 9" />
                        </svg>
                    </div>
                    <div className="text-lg font-semibold text-gray-800 mb-2">Confirm Allocation</div>
                    <div className="text-gray-500 text-sm mb-6">
                        Allocate <span className="font-bold text-green-700">{confirmApprovePopup.app.student.name}</span>
                        {" "}to{" "}
                        <span className="font-bold text-green-700">
                            {confirmApprovePopup.app.choices.find(c => (c.companyId || c.company) === confirmApprovePopup.companyId)?.company || "selected company"}
                        </span>?
                    </div>
                    <div className="flex justify-center gap-4">
                        <button
                            className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                            onClick={() => setConfirmApprovePopup({ open: false, app: null, companyId: "" })}
                        >
                            Cancel
                        </button>
                        <button
                            className="px-5 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 shadow-sm transition-colors"
                            onClick={() => {
                                handleApprovedApplication(confirmApprovePopup.app._id, confirmApprovePopup.companyId);
                                setConfirmApprovePopup({ open: false, app: null, companyId: "" });
                            }}
                        >
                            Yes, Allocate
                        </button>
                    </div>
                </div>
            </div>
        )}
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
        {/* Download Allocated Students Popup */}
        {downloadPopupOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 max-w-lg w-full">
                    <div className="text-lg font-semibold text-gray-800 mb-1">Download Students</div>
                    <div className="text-gray-500 text-sm mb-4">Choose company-wise or all students download.</div>
                    <div className="flex items-center bg-gray-100 rounded-lg p-1 mb-4">
                        <button
                            type="button"
                            className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
                                downloadMode === "company" ? "bg-white text-red-700 font-semibold shadow-sm" : "text-gray-600 hover:text-gray-800"
                            }`}
                            onClick={() => setDownloadMode("company")}
                        >
                            Company
                        </button>
                        <button
                            type="button"
                            className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
                                downloadMode === "all" ? "bg-white text-red-700 font-semibold shadow-sm" : "text-gray-600 hover:text-gray-800"
                            }`}
                            onClick={() => setDownloadMode("all")}
                        >
                            All
                        </button>
                    </div>
                    {downloadMode === "company" ? (
                        <>
                            <div className="mb-3">
                                <input
                                    type="text"
                                    value={companySearch}
                                    onChange={(e) => setCompanySearch(e.target.value)}
                                    placeholder="Search company..."
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                                />
                            </div>
                            <div className="mb-3">
                                <select
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 text-gray-700"
                                    value={downloadType}
                                    onChange={(e) => setDownloadType(e.target.value)}
                                >
                                    <option value="all">All</option>
                                    <option value="alloted">Alloted</option>
                                    <option value="not_alloted">Not Alloted</option>
                                </select>
                            </div>
                            <div className="border border-gray-200 rounded-lg max-h-56 overflow-y-auto">
                                {filteredCompanies.length > 0 ? (
                                    filteredCompanies.map((company) => (
                                        <button
                                            key={company._id}
                                            type="button"
                                            className={`w-full text-left px-3 py-2 text-sm hover:bg-red-50 hover:text-red-700 ${
                                                selectedCompanyId === company._id ? "bg-red-50 text-red-700 font-semibold" : "text-gray-700"
                                            }`}
                                            onClick={() => setSelectedCompanyId(company._id)}
                                        >
                                            {company.name}
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-3 py-2 text-sm text-gray-400">No companies found.</div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="mb-3">
                            <select
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 text-gray-700"
                                value={allDownloadType}
                                onChange={(e) => setAllDownloadType(e.target.value)}
                            >
                                <option value="alloted">Alloted</option>
                                <option value="unalloted">Unalloted</option>
                            </select>
                        </div>
                    )}
                    <div className="flex justify-end gap-3 mt-5">
                        <button
                            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                            onClick={() => setDownloadPopupOpen(false)}
                            disabled={downloading}
                        >
                            Cancel
                        </button>
                        <button
                            className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 shadow-sm transition-colors disabled:opacity-50"
                            onClick={downloadMode === "company" ? handleDownloadCompanyList : handleDownloadAllCompanyList}
                            disabled={(downloadMode === "company" && !selectedCompanyId) || downloading}
                        >
                            {downloading ? "Downloading..." : "Download"}
                        </button>
                    </div>
                </div>
            </div>
        )}
        </div>
    );
}

export default StudentApplicationList;
