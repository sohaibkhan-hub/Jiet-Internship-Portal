import React, { useState } from "react";
import { MdSave, MdAdd, MdClose, MdArrowDropDown } from "react-icons/md";
import { useAppSelector, useAppDispatch } from "../../../../hooks/redux";
import { getAllBranchesAsync } from "../../../../store/slices/branchDomainSlice";
import { useEffect } from "react";
import { toast } from "react-toastify";

function AddUpdateDomainModel({ onClose, initialData = null, isUpdate = false, onSubmit }) {
    const branchRef = React.useRef(null);
    const dispatch = useAppDispatch();
    const { allBranches = [] } = useAppSelector((state) => state.domainBranch || {});

    useEffect(() => {
        dispatch(getAllBranchesAsync());
    }, [dispatch]);

    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        applicableBranches: initialData?.applicableBranches || [],
        isActive: typeof initialData?.isActive === 'boolean' ? initialData.isActive : true
    });
    const [isBranchOpen, setIsBranchOpen] = useState(false);
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const statusRef = React.useRef(null);

    useEffect(() => {
        setFormData({
            name: initialData?.name || "",
            applicableBranches: initialData?.applicableBranches || [],
            isActive: typeof initialData?.isActive === 'boolean' ? initialData.isActive : true
        });
    }, [initialData]);

    React.useEffect(() => {
        function handleClickOutside(event) {
            if (branchRef.current && !branchRef.current.contains(event.target) && isBranchOpen) {
                setIsBranchOpen(false);
            }
            if (statusRef.current && !statusRef.current.contains(event.target) && isStatusOpen) {
                setIsStatusOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isBranchOpen, isStatusOpen]);

    const handleBranchDropdown = () => {
        setIsBranchOpen((prev) => !prev);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setFormData((prev) => ({ ...prev, [name]: checked }));
        } else if (name === 'isActive') {
            setFormData((prev) => ({ ...prev, isActive: value === 'true' }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleStatusDropdown = () => {
        setIsStatusOpen((prev) => !prev);
    };

    const addBranch = (branchId) => {
        if (!formData.applicableBranches.includes(branchId)) {
            setFormData((prev) => ({ ...prev, applicableBranches: [...prev.applicableBranches, branchId] }));
        }
        setIsBranchOpen(false);
    };

    const removeBranch = (branchId) => {
        setFormData((prev) => ({ ...prev, applicableBranches: prev.applicableBranches.filter(b => b !== branchId) }));
    };

    const handleSubmit = () => {
        if (!formData.name || formData.applicableBranches.length === 0) {
            toast.error("Please fill in all required fields.");
            return;
        }
        if (onSubmit) {
            onSubmit(formData);
        }
    };

    return (
        <div className="w-full max-w-lg mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 p-6 md:p-8 animate-fadeIn">
            <h3 className="text-xl font-semibold !text-gray-700 mb-2 border-b pb-2">
                {isUpdate ? "Update Domain" : "Add New Domain"}
            </h3>
            <p className="text-sm text-gray-500 mb-6">
                {isUpdate ? "Edit domain details and applicable branches." : "Enter domain details and select applicable branches."}
            </p>
            <div className="mb-8">
                <div className="grid grid-cols-1 gap-6 mb-4 pt-3">
                    <div>
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
                    <div ref={branchRef}>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Applicable Branches</label>
                        <div className="min-h-[50px] p-3 bg-white border border-gray-300 rounded-lg flex flex-wrap gap-2 mb-2 mt-3">
                            {formData.applicableBranches.map((branchId, i) => {
                                const branchObj = allBranches.find(b => b._id === branchId);
                                return (
                                    <span key={i} className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 border border-red-300 text-xs font-semibold rounded-full shadow-sm">
                                        {branchObj ? branchObj.name : branchId}
                                        <button onClick={() => removeBranch(branchId)} className="hover:text-red-900"><MdClose /></button>
                                    </span>
                                );
                            })}
                            {formData.applicableBranches.length === 0 && <span className="text-gray-400 text-xs py-1">No branches selected</span>}
                        </div>
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
                                    {(() => {
                                        const availableBranches = allBranches.filter(b => !formData.applicableBranches.includes(b._id));
                                        return availableBranches.map((b, i) => (
                                            <button
                                                key={b._id}
                                                onClick={() => addBranch(b._id)}
                                                className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 hover:text-red-700 flex justify-between group"
                                            >
                                                {b.name} <MdAdd className="opacity-0 group-hover:opacity-100" />
                                            </button>
                                        ));
                                    })()}
                                    {allBranches.filter(b => !formData.applicableBranches.includes(b._id)).length === 0 && (
                                        <div className="px-4 py-2 text-gray-400 text-sm">All branches selected</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Status section for edit mode */}
                    {isUpdate && (
                        <div ref={statusRef} className="relative">
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Status</label>
                            <button
                                type="button"
                                onClick={handleStatusDropdown}
                                className={`w-full flex items-center justify-between px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none transition-colors ${formData.isActive ? 'text-green-700 border-green-300' : 'text-red-700 border-red-300'} hover:border-red-400`}
                            >
                                <span className={`font-bold ${formData.isActive ? 'text-green-700' : 'text-red-700'}`}>{formData.isActive ? 'Active' : 'Inactive'}</span>
                                <MdArrowDropDown className="ml-2 text-gray-400" />
                            </button>
                            {isStatusOpen && (
                                <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                                    <button
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-green-50 hover:text-green-700 ${formData.isActive ? 'font-bold text-green-700' : ''}`}
                                        onClick={() => { setFormData((prev) => ({ ...prev, isActive: true })); setIsStatusOpen(false); }}
                                    >
                                        Active
                                    </button>
                                    <button
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-red-50 hover:text-red-700 ${!formData.isActive ? 'font-bold text-red-700' : ''}`}
                                        onClick={() => { setFormData((prev) => ({ ...prev, isActive: false })); setIsStatusOpen(false); }}
                                    >
                                        Inactive
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
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
                    {isUpdate ? "Update Domain" : "Add Domain"}
                </button>
            </div>
        </div>
    );
}

export default AddUpdateDomainModel;
