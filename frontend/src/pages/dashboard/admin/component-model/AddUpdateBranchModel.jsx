import React, { useState } from "react";
import { MdSave, MdAdd, MdClose, MdArrowDropDown } from "react-icons/md";
import { toast } from "react-toastify";

function AddUpdateBranchModel({ onClose, initialData = null, isUpdate = false, onSubmit }) {
  // Ref for college dropdown
  const collegeRef = React.useRef(null);
  const statusRef = React.useRef(null);

  // --- STATE MANAGEMENT ---
  const [formData, setFormData] = useState(() =>
    initialData
      ? {
          college: initialData.college || "JDAT",
          name: initialData.name || "",
          code: initialData.code || "",
          programType: initialData.programType || "B.Tech",
          hodName: initialData.hodName || "",
          hodEmail: initialData.hodEmail || "",
          externalBranchDetails:
            initialData.externalBranchDetails ||
            initialData.externalMappings ||
            [],
          isActive:
            typeof initialData.isActive === "boolean"
              ? initialData.isActive
              : true,
        }
      : {
          college: "JDAT",
          name: "",
          code: "",
          programType: "B.Tech",
          hodName: "",
          hodEmail: "",
          externalBranchDetails: [],
          isActive: true,
        },
  );
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  // College dropdown open state
  const [isCollegeOpen, setIsCollegeOpen] = useState(false);

  // Close college dropdown on outside click
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (
        collegeRef.current &&
        !collegeRef.current.contains(event.target) &&
        isCollegeOpen
      ) {
        setIsCollegeOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCollegeOpen]);

  // External branch input state
  const [externalBranchInput, setExternalBranchInput] = useState({
    collegeId: "",
    branchId: "",
    year: "",
  });

  // Add external branch
  const addExternalBranch = () => {
    if (
      !externalBranchInput.collegeId ||
      !externalBranchInput.branchId ||
      !externalBranchInput.year
    ) {
      alert("Please fill all external branch fields.");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      externalBranchDetails: [
        ...prev.externalBranchDetails,
        { ...externalBranchInput },
      ],
    }));
    setExternalBranchInput({ collegeId: "", branchId: "", year: "" });
  };

  // Remove external branch
  const removeExternalBranch = (idx) => {
    setFormData((prev) => ({
      ...prev,
      externalBranchDetails: prev.externalBranchDetails.filter(
        (_, i) => i !== idx,
      ),
    }));
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "isActive") {
      setFormData((prev) => ({ ...prev, isActive: value === "true" }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };
  const handleStatusDropdown = () => {
    setIsStatusOpen((prev) => !prev);
  };
  const handleExternalInputChange = (e) => {
    const { name, value } = e.target;
    setExternalBranchInput((prev) => ({ ...prev, [name]: value }));
  };

  // Submit handler
  const handleSubmit = () => {
    if (
      !formData.name ||
      !formData.code ||
      !formData.programType ||
      !formData.hodName ||
      !formData.hodEmail ||
      formData.externalBranchDetails.length === 0
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  // --- POPUP MODAL UI ---
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-4xl mx-auto overflow-y-auto custom-scrollbar h-[70vh] bg-white rounded-2xl shadow-xl border border-gray-200 p-6 md:p-8 animate-fadeIn relative">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-red-600 text-2xl"
          onClick={onClose}
          aria-label="Close"
        >
          <MdClose />
        </button>
        {/* Page Title */}
        <h3 className="text-xl font-semibold !text-gray-700 mb-2 border-b pb-2">
          {isUpdate ? "Update Branch" : "Add New Branch"}
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          {isUpdate
            ? "Edit branch details and update external branch mappings."
            : "Enter branch details and add external branch mappings."}
        </p>
        <div className="mb-8">
          <div className="grid grid-cols-2 gap-6 mb-4 pt-3">
            {/* Status Dropdown (edit only) */}
            {isUpdate && (
              <div ref={statusRef} className="col-span-2 relative">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Status
                </label>
                <button
                  type="button"
                  onClick={handleStatusDropdown}
                  className={`w-full flex items-center justify-between px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none transition-colors ${formData.isActive ? "text-green-700 border-green-300" : "text-red-700 border-red-300"} hover:border-red-400`}
                >
                  <span
                    className={`font-bold ${formData.isActive ? "text-green-700" : "text-red-700"}`}
                  >
                    {formData.isActive ? "Active" : "Inactive"}
                  </span>
                  <MdArrowDropDown className="ml-2 text-gray-400" />
                </button>
                {isStatusOpen && (
                  <div
                    className="absolute left-0 right-0 z-20 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-w-full"
                    style={{ minWidth: "160px" }}
                  >
                    <button
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-green-50 hover:text-green-700 ${formData.isActive ? "font-bold text-green-700" : ""}`}
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, isActive: true }));
                        setIsStatusOpen(false);
                      }}
                    >
                      Active
                    </button>
                    <button
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-red-50 hover:text-red-700 ${!formData.isActive ? "font-bold text-red-700" : ""}`}
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, isActive: false }));
                        setIsStatusOpen(false);
                      }}
                    >
                      Inactive
                    </button>
                  </div>
                )}
              </div>
            )}
            {/* College Dropdown */}
            <div ref={collegeRef}>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                College
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsCollegeOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-red-400"
                >
                  {formData.college ? formData.college : "Select College..."}
                  <MdArrowDropDown />
                </button>
                {isCollegeOpen && (
                  <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {["JIET", "JDAT"].map((college, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, college }));
                          setIsCollegeOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 hover:text-red-700 flex justify-between group"
                      >
                        {college}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* Branch Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Branch Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full bg-white border border-gray-300 text-gray-700 py-2.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-500 transition-all"
                placeholder="e.g. Artificial Intelligence"
              />
            </div>
            {/* Branch Code */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Branch Code
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                className="w-full bg-white border border-gray-300 text-gray-700 py-2.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-500 transition-all"
                placeholder="e.g. JDAT-AIML"
              />
            </div>
            {/* Program Type */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Program Type
              </label>
              <input
                type="text"
                name="programType"
                value={formData.programType}
                onChange={handleInputChange}
                className="w-full bg-white border border-gray-300 text-gray-700 py-2.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-500 transition-all"
                placeholder="e.g. B.Tech"
              />
            </div>
            {/* HOD Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                HOD Name
              </label>
              <input
                type="text"
                name="hodName"
                value={formData.hodName}
                onChange={handleInputChange}
                className="w-full bg-white border border-gray-300 text-gray-700 py-2.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-500 transition-all"
                placeholder="e.g. Dr. HOD"
              />
            </div>
            {/* HOD Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                HOD Email
              </label>
              <input
                type="email"
                name="hodEmail"
                value={formData.hodEmail}
                onChange={handleInputChange}
                className="w-full bg-white border border-gray-300 text-gray-700 py-2.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-500 transition-all"
                placeholder="e.g. hod@college.edu"
              />
            </div>
            {/* External Branch Details */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                External Branch Details
              </label>
              <div className="flex flex-col gap-2 mb-2">
                {formData.externalBranchDetails.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex gap-2 items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
                  >
                    <span className="text-xs text-gray-700">
                      College ID: {item.collegeId}
                    </span>
                    <span className="text-xs text-gray-700">
                      Branch ID: {item.branchId}
                    </span>
                    <span className="text-xs text-gray-700">
                      Year: {item.year}
                    </span>
                    <button
                      onClick={() => removeExternalBranch(idx)}
                      className="ml-2 text-gray-400 hover:text-red-600"
                    >
                      <MdClose />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  name="collegeId"
                  value={externalBranchInput.collegeId}
                  onChange={handleExternalInputChange}
                  className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-500 transition-all"
                  placeholder="College ID"
                />
                <input
                  type="text"
                  name="branchId"
                  value={externalBranchInput.branchId}
                  onChange={handleExternalInputChange}
                  className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-500 transition-all"
                  placeholder="Branch ID"
                />
                <input
                  type="text"
                  name="year"
                  value={externalBranchInput.year}
                  onChange={handleExternalInputChange}
                  className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-500 transition-all"
                  placeholder="Year"
                />
              </div>
              <button
                type="button"
                onClick={addExternalBranch}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 shadow-sm transition-all"
              >
                Add External Branch
              </button>
            </div>
          </div>
        </div>
        {/* ACTIONS */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 shadow-sm hover:shadow-md transition-all flex items-center gap-2"
          >
            <MdSave className="text-lg" />
            {isUpdate ? "Update Branch" : "Add Branch"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddUpdateBranchModel;
