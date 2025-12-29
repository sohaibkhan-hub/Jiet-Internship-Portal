import Timeline from "../../../components/Timeline";
import HeaderProfile from "../../../components/HeaderProfile";
import { 
  MdFormatListBulleted, 
  MdPlace, 
  MdDomain, 
  MdWork, 
  MdCheckCircle,
  MdDescription
} from "react-icons/md";
import { useState } from "react";
import { useAppSelector } from "../../../hooks/redux";

function ApplicationStatus(props) {
  const [showDetails, setShowDetails] = useState(true);
  const profile = useAppSelector((state) => state.auth.user.profile || {});
  // Use API data for internship details
  const currentData = profile.internshipData || null;

  // Helper to format status text nicely
  const formatStatus = (status) => {
    if (!status) return "N/A";
    return status.replace(/_/g, " ");
  };

  return (
    <div className="flex bg-gradient-to-br from-gray-100 via-white to-gray-200 min-h-[calc(100vh-5rem)]">
      {/* Main Content */}
      <section className="w-full max-w-7xl mx-auto px-0 md:px-0">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-12 p-0 md:p-0">
          <HeaderProfile />
          <div className="mt-4 px-0 md:px-8">
            <h3 className="text-xl font-semibold !text-gray-700 mb-4 border-b pb-2">Application Status</h3>
            {currentData && currentData.isFormSubmitted && currentData.approvalStatusHistory.length > 0 ? (
              <Timeline history={currentData.approvalStatusHistory} />
            ) : (
              <div className="flex flex-col items-center justify-center py-10 my-6">
                <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" fill="none" />
                </svg>
                <div className="text-lg font-semibold text-gray-500 mb-1">No Timeline Data</div>
                <div className="text-gray-400 max-w-lg text-center px-1">
                  Your application timeline will appear here once you have submitted your internship preferences and the review process has started.<br/>
                  Please complete and submit your application to track your progress.
                </div>
              </div>
            )}
          </div>
            
          {/* Internship Details Section - UPDATED UI */}
          <div className="pt-0 md:!pt-12">
            {currentData && currentData.isFormSubmitted && currentData.approvalStatusHistory.length > 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Header Bar */}
                <button
                  className="w-full flex items-center justify-between px-6 py-3 bg-white hover:bg-gray-50 transition-colors duration-200"
                  onClick={() => setShowDetails((prev) => !prev)}
                >
                  <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-50 rounded-lg">
                          <MdWork className="text-red-600 w-5 h-5" />
                      </div>
                      <span className="text-lg font-bold text-gray-800">Internship Details</span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${showDetails ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Expandable Content */}
                {showDetails && (
                  <div className="p-6 pt-2 border-t border-gray-100">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                      {/* Left Column: Preferred Domains */}
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <h4 className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                          <MdDomain className="text-gray-400 text-lg" /> Preferred Domains
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {(Array.isArray(currentData.preferredDomains) && currentData.preferredDomains.length > 0)
                            ? currentData.preferredDomains.map((domain, idx) => {
                                  const name = typeof domain === 'object' ? domain.name : domain;
                                  return name ? (
                                    <span key={idx} className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-full shadow-sm">
                                      {name}
                                    </span>
                                  ) : null;
                                })
                            : <span className="text-gray-400 italic">No domains selected</span>
                          }
                        </div>
                      </div>

                      {/* Right Column: Company Choices */}
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <h4 className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                          <MdFormatListBulleted className="text-gray-400 text-lg" /> Company Priorities
                        </h4>
                        <div className="space-y-3">
                          {(Array.isArray(currentData.choices) && currentData.choices.length > 0)
                            ? currentData.choices.map((choice, idx) => (
                                <div key={idx} className="flex items-center bg-white px-4 py-2.5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                  {/* Priority Badge */}
                                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 font-bold rounded-full text-sm mr-4">
                                    {choice.priority}
                                  </div>
                                  {/* Company Details */}
                                  <div className="flex-1">
                                    <div className="font-semibold text-gray-800 text-sm md:text-base">
                                      {choice.company}
                                    </div>
                                    <div className="flex items-center text-xs text-gray-500 mt-0.5">
                                      <MdPlace className="mr-1 text-gray-400" /> {choice.location}
                                    </div>
                                  </div>
                                </div>
                              ))
                            : <div className="text-gray-400 italic">No choices submitted</div>
                          }
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <hr className="border-gray-100 mb-8" />

                    {/* Bottom Grid: General Details */}

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-50 rounded-lg">
                          <MdDescription className="text-red-600 w-5 h-5" />
                      </div>
                      <span className="text-lg font-bold text-gray-800">Application Summary</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-4">
                      {/* Item 1 */}
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Participating</label>
                        <div className={`font-semibold ${currentData.isParticipating ? 'text-green-600' : 'text-gray-700'}`}>
                          {currentData.isParticipating ? 'Yes' : 'No'}
                        </div>
                      </div>

                      {/* Item 2 */}
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Expected Salary</label>
                        <div className="font-semibold text-gray-800 text-lg">
                          {currentData.expectedSalary || 'N/A'}
                        </div>
                      </div>

                      {/* Item 3 */}
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Alternative Career Path</label>
                        <br/>
                        <div className="font-medium text-gray-700 bg-gray-100 inline-block px-2 py-0.5 rounded text-sm">
                          {currentData.alternativeCareerPath || 'Not specified'}
                        </div>
                      </div>

                      {/* Item 4 */}
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Allocated ID</label>
                        <div className="font-mono text-sm text-gray-600 truncate" title={currentData.allocatedCompany}>
                          {currentData.allocatedCompany || 'N/A'}
                        </div>
                      </div>

                      {/* Item 5 - Status */}
                      <div className="col-span-2 md:col-span-2 bg-green-50 rounded-lg px-4 py-2 border border-green-100 flex items-center gap-4">
                          <MdCheckCircle className="text-green-500 text-xl" />
                          <div>
                              <label className="block text-xs font-bold text-green-700 uppercase tracking-wide">Current Status</label>
                              <div className="font-bold text-green-800 text-sm">
                                  {formatStatus(currentData.approvalStatus)}
                              </div>
                          </div>
                      </div>
                       
                       {/* Item 6 - Approval */}
                       <div className="col-span-2 md:col-span-2 bg-blue-50 rounded-lg px-4 py-2 border border-blue-100 flex items-center gap-4">
                          <MdVerified className="text-blue-500 text-xl" />
                          <div>
                              <label className="block text-xs font-bold text-blue-700 uppercase tracking-wide">Allocation Status</label>
                              <div className="font-bold text-blue-800 text-sm">
                                  {formatStatus(currentData.allocationStatus)}
                              </div>
                          </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}

// Simple wrapper for the verified icon if not imported above
function MdVerified(props) {
    return <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" {...props}><path fill="none" d="M0 0h24v24H0z"></path><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"></path></svg>;
}
export default ApplicationStatus;