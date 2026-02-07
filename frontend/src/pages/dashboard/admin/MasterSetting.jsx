import React, { useState } from "react";
import { toast } from "react-toastify";
import HeaderProfile from "../../../components/HeaderProfile";
import { useAppDispatch } from "../../../hooks/redux";
import { fullResetStudentsAsync, resetStudentChoicesAsync, setAdminLoading } from "../../../store/slices/adminSlice";
import { adminService } from "../../../services/adminService";

function ActionCard({ title, description, buttonText, tone = "danger", onClick, isLoading, disabled, secondaryText, onSecondaryClick, secondaryTone = "neutral" }) {
  const toneClasses = {
    danger: "bg-red-600 hover:bg-red-700",
    warning: "bg-yellow-600 hover:bg-yellow-700",
    neutral: "bg-gray-800 hover:bg-gray-900",
  };
  const secondaryClasses = {
    danger: "bg-red-100 text-red-700 hover:bg-red-200",
    warning: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
    neutral: "bg-gray-100 text-gray-700 hover:bg-gray-200",
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="text-lg font-semibold text-gray-800 mb-2">{title}</div>
      <div className="text-sm text-gray-500 mb-4">{description}</div>
      <div className="flex items-center gap-3">
        {secondaryText && (
          <button
            type="button"
            onClick={onSecondaryClick}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${secondaryClasses[secondaryTone]}`}
          >
            {secondaryText}
          </button>
        )}
        <button
          type="button"
          onClick={onClick}
          disabled={isLoading || disabled}
          className={`px-5 py-2.5 rounded-lg text-white font-medium transition-colors ${toneClasses[tone]} ${(isLoading || disabled) ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          {isLoading ? "Processing..." : buttonText}
        </button>
      </div>
    </div>
  );
}

function MasterSetting() {
  const dispatch = useAppDispatch();
  const [loadingKey, setLoadingKey] = useState("");
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [resetEnabled, setResetEnabled] = useState(false);
  const [fullResetEnabled, setFullResetEnabled] = useState(false);
  const [featureFlags, setFeatureFlags] = useState({
    enableUpdateDomain: true,
    enableApplyCompany: true,
    enableCompanyList: true,
    enableMyApplication: true,
  });
  const [featureLoading, setFeatureLoading] = useState(false);

  React.useEffect(() => {
    const loadFlags = async () => {
      try {
        const flags = await adminService.getFeatureFlags();
        if (flags) {
          setFeatureFlags({
            enableUpdateDomain: !!flags.enableUpdateDomain,
            enableApplyCompany: !!flags.enableApplyCompany,
            enableCompanyList: !!flags.enableCompanyList,
            enableMyApplication: !!flags.enableMyApplication,
          });
        }
      } catch (err) {
        toast.error(typeof err === "string" ? err : err?.message || "Failed to load feature flags");
      }
    };
    loadFlags();
  }, []);

  const handleResetChoices = async () => {
    try {
      setLoadingKey("resetChoices");
      const response = await dispatch(resetStudentChoicesAsync()).unwrap();
      toast.success(response.message || "All student choices reset successfully");
    } catch (err) {
      toast.error(typeof err === "string" ? err : err?.message || "Failed to reset choices");
    } finally {
      setLoadingKey("");
      setResetEnabled(false);
    }
  };

  const handleFullReset = async () => {
    try {
      setLoadingKey("fullReset");
      const response = await dispatch(fullResetStudentsAsync()).unwrap();
      toast.success(response.message || "Full reset completed successfully");
    } catch (err) {
      toast.error(typeof err === "string" ? err : err?.message || "Full reset failed");
    } finally {
      setLoadingKey("");
      setFullResetEnabled(false);
    }
  };

  const handleDownloadPasswords = async () => {
    try {
      setLoadingKey("downloadPasswords");
      dispatch(setAdminLoading(true));
      const blob = await adminService.downloadStudentTempPasswords();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "student_temp_passwords.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Password file downloaded");
    } catch (err) {
      toast.error(typeof err === "string" ? err : err?.message || "Failed to download file");
    } finally {
      setLoadingKey("");
      dispatch(setAdminLoading(false));
    }
  };

  const handleBulkRegister = async () => {
    if (!bulkFile) {
      toast.error("Please choose a file to upload.");
      return;
    }
    try {
      setBulkLoading(true);
      dispatch(setAdminLoading(true));
      const formData = new FormData();
      formData.append("students", bulkFile);
      const response = await adminService.bulkRegisterStudents(formData);
      if (response && response.type && response.type.includes("application/json")) {
        const text = await response.text();
        let json = {};
        try {
          json = JSON.parse(text);
        } catch {
          json = {};
        }
        const failed = json?.data || [];
        if (Array.isArray(failed) && failed.length === 0) {
          toast.success(json?.message || "Bulk registration completed successfully");
        } else {
          toast.error("Bulk registration completed with some skipped/failed rows.");
        }
      } else {
        const url = window.URL.createObjectURL(new Blob([response]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "bulk_register_errors.xlsx");
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.error("Bulk registration failed for some rows. Error file downloaded.");
      }
    } catch (err) {
      toast.error(typeof err === "string" ? err : err?.message || "Bulk register failed");
    } finally {
      setBulkLoading(false);
      dispatch(setAdminLoading(false));
    }
  };

  const handleToggleFeature = async (key) => {
    try {
      setFeatureLoading(true);
      dispatch(setAdminLoading(true));
      const updated = await adminService.updateFeatureFlags({
        ...featureFlags,
        [key]: !featureFlags[key],
      });
      setFeatureFlags({
        enableUpdateDomain: !!updated.enableUpdateDomain,
        enableApplyCompany: !!updated.enableApplyCompany,
        enableCompanyList: !!updated.enableCompanyList,
        enableMyApplication: !!updated.enableMyApplication,
      });
      toast.success("Feature flags updated");
    } catch (err) {
      toast.error(typeof err === "string" ? err : err?.message || "Failed to update feature flags");
    } finally {
      setFeatureLoading(false);
      dispatch(setAdminLoading(false));
    }
  };

  return (
    <div className="flex bg-gradient-to-br from-gray-100 via-white to-gray-200 min-h-[100vh]">
      <section className="bg-white flex-1 flex flex-col px-0 md:px-0 w-full max-w-7xl mx-auto">
        <HeaderProfile />
        <div className="w-full max-w-7xl mx-auto">
          <div className=" rounded-2xl p-8">
            <h3 className="text-xl font-semibold !text-gray-700 mb-4 border-b pb-2">Master Settings</h3>
            <div className="mt-6 space-y-8">
              <div>
                <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">Feature Access</div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <ActionCard
                    title="Update Domains"
                    description="Show or hide Update Domains in student section."
                    buttonText={featureFlags.enableUpdateDomain ? "Deactivate" : "Activate"}
                    tone="neutral"
                    onClick={() => handleToggleFeature("enableUpdateDomain")}
                    isLoading={featureLoading}
                  />
                  <ActionCard
                    title="Apply Company"
                    description="Show or hide Apply Company in student section."
                    buttonText={featureFlags.enableApplyCompany ? "Deactivate" : "Activate"}
                    tone="neutral"
                    onClick={() => handleToggleFeature("enableApplyCompany")}
                    isLoading={featureLoading}
                  />
                  <ActionCard
                    title="Company List"
                    description="Show or hide Company List in student section."
                    buttonText={featureFlags.enableCompanyList ? "Deactivate" : "Activate"}
                    tone="neutral"
                    onClick={() => handleToggleFeature("enableCompanyList")}
                    isLoading={featureLoading}
                  />
                  <ActionCard
                    title="My Applications"
                    description="Show or hide My Applications in student section."
                    buttonText={featureFlags.enableMyApplication ? "Deactivate" : "Activate"}
                    tone="neutral"
                    onClick={() => handleToggleFeature("enableMyApplication")}
                    isLoading={featureLoading}
                  />
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">Student Data</div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <ActionCard
                    title="Bulk Register Students"
                    description="Upload the verified sheet to create student accounts."
                    buttonText="Bulk Register"
                    tone="warning"
                    onClick={() => setBulkModalOpen(true)}
                    isLoading={bulkLoading}
                  />
                  <ActionCard
                    title="Download Temp Passwords"
                    description="Download the Excel file containing all student temporary passwords."
                    buttonText="Download"
                    tone="neutral"
                    onClick={handleDownloadPasswords}
                    isLoading={loadingKey === "downloadPasswords"}
                  />
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">System Reset</div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <ActionCard
                    title="Reset All Student Choices"
                    description="Clears all student choices, allocations, and resets company filled seats. This does not remove preferred domains."
                    buttonText="Reset Choices"
                    tone="warning"
                    onClick={handleResetChoices}
                    isLoading={loadingKey === "resetChoices"}
                    disabled={!resetEnabled}
                    secondaryText={resetEnabled ? "Disable" : "Enable"}
                    onSecondaryClick={() => setResetEnabled((v) => !v)}
                    secondaryTone="warning"
                  />
                  <ActionCard
                    title="Full Reset (Wipe Data)"
                    description="Clears preferred domains, choices, allocation status, and resets company filled seats. Use with caution."
                    buttonText="Full Reset"
                    tone="danger"
                    onClick={handleFullReset}
                    isLoading={loadingKey === "fullReset"}
                    disabled={!fullResetEnabled}
                    secondaryText={fullResetEnabled ? "Disable" : "Enable"}
                    onSecondaryClick={() => setFullResetEnabled((v) => !v)}
                    secondaryTone="danger"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bulk Register Modal */}
      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 max-w-lg w-full">
            <div className="text-lg font-semibold text-gray-800 mb-1">Bulk Register Students</div>
            <div className="text-gray-500 text-sm mb-4">Upload the verified sheet to create accounts.</div>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setBulkFile(e.target.files?.[0] || null)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 text-sm"
            />
            <div className="flex justify-end gap-3 mt-5">
              <button
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                onClick={() => setBulkModalOpen(false)}
                disabled={bulkLoading}
              >
                Close
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 shadow-sm transition-colors disabled:opacity-50"
                onClick={handleBulkRegister}
                disabled={!bulkFile || bulkLoading}
              >
                {bulkLoading ? "Uploading..." : "Bulk Register"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MasterSetting;
