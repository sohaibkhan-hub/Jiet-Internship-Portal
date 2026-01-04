import React from "react";
import { studentService } from "../services/studentService";

function Timeline({history, profile}) {

  // --- Dynamic status steps logic ---
  const allSteps = [
    "NOT_APPLIED",
    "SUBMITTED",
    "PENDING_REVIEW",
    "APPROVED_BY_TPO",
    "REJECTED_BY_TPO",
    "ALLOCATED",
    "REJECTED"
  ];

  // Generate Training Letter PDF via backend template
  const generateTrainingLetterPDF = async () => {
    try {
      const blob = await studentService.downloadTrainingLetter();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Training_Letter.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading training letter:", error);
      alert("Failed to download training letter. Please try again.");
    }
  };

  // Find if ALLOCATED or REJECTED is present in history
  const hasAllocated = history?.some(h => h.status === "ALLOCATED");
  const hasRejected = history?.some(h => h.status === "REJECTED");
  const hasRejectedByTpo = history?.some(h => h.status === "REJECTED_BY_TPO");

  let statusSteps = allSteps;
  if (hasAllocated) {
    // Only show steps up to ALLOCATED, and exclude REJECTED_BY_TPO
    statusSteps = allSteps.slice(0, allSteps.indexOf("ALLOCATED") + 1).filter(
      step => step !== "REJECTED_BY_TPO"
    );
  } else if (hasRejected) {
    // Only show steps up to REJECTED, and exclude APPROVED_BY_TPO, ALLOCATED
    // But DO NOT exclude REJECTED_BY_TPO if it is present in history
    statusSteps = allSteps.slice(0, allSteps.indexOf("REJECTED") + 1).filter(
      step => step !== "APPROVED_BY_TPO" && step !== "ALLOCATED"
    );
    // If REJECTED_BY_TPO is present in history, ensure it is included in statusSteps at the correct position
    if (hasRejectedByTpo && !statusSteps.includes("REJECTED_BY_TPO")) {
      const idx = allSteps.indexOf("REJECTED_BY_TPO");
      statusSteps.splice(idx, 0, "REJECTED_BY_TPO");
    }
  } else if (hasRejectedByTpo) {
    statusSteps = allSteps.slice(0, allSteps.indexOf("REJECTED_BY_TPO") + 1);
  }

  // Show all steps up to the next final status (ALLOCATED or REJECTED) if not already at a final status
  let lastStatusIdx = -1;
  if (history && history.length > 0) {
    const lastStatus = history[history.length - 1].status;
    lastStatusIdx = statusSteps.indexOf(lastStatus);
    // If last status is ALLOCATED or REJECTED, cut timeline there (final step)
    if (lastStatus === "ALLOCATED") {
      // Only show steps up to ALLOCATED, and exclude REJECTED_BY_TPO
      statusSteps = allSteps.slice(0, allSteps.indexOf("ALLOCATED") + 1).filter(
        step => step !== "REJECTED_BY_TPO"
      );
    } else if (lastStatus === "REJECTED") {
      // Only show steps up to REJECTED, and exclude APPROVED_BY_TPO, ALLOCATED
      // But DO NOT exclude REJECTED_BY_TPO if it is present in history
      statusSteps = allSteps.slice(0, allSteps.indexOf("REJECTED") + 1).filter(
        step => step !== "APPROVED_BY_TPO" && step !== "ALLOCATED"
      );
      if (hasRejectedByTpo && !statusSteps.includes("REJECTED_BY_TPO")) {
        const idx = allSteps.indexOf("REJECTED_BY_TPO");
        statusSteps.splice(idx, 0, "REJECTED_BY_TPO");
      }
    } else if (lastStatus === "REJECTED_BY_TPO") {
      statusSteps = allSteps.slice(0, allSteps.indexOf("REJECTED_BY_TPO") + 1);
    } else {
      // Not at a final status, show all steps up to the next final status
      // (e.g., if last is PENDING_REVIEW, show up to ALLOCATED or REJECTED)
      // Find the next final status after lastStatusIdx
      let nextFinalIdx = allSteps.length - 1;
      for (let i = lastStatusIdx + 1; i < allSteps.length; i++) {
        if (allSteps[i] === "ALLOCATED" || allSteps[i] === "REJECTED") {
          nextFinalIdx = i;
          break;
        }
      }
      statusSteps = allSteps.slice(0, nextFinalIdx + 1);
      // For REJECTED path, remove APPROVED_BY_TPO, ALLOCATED if REJECTED is the next final, but keep REJECTED_BY_TPO if present in history
      if (allSteps[nextFinalIdx] === "REJECTED") {
        statusSteps = statusSteps.filter(
          step => step !== "APPROVED_BY_TPO" && step !== "ALLOCATED"
        );
        if (hasRejectedByTpo && !statusSteps.includes("REJECTED_BY_TPO")) {
          const idx = allSteps.indexOf("REJECTED_BY_TPO");
          statusSteps.splice(idx, 0, "REJECTED_BY_TPO");
        }
      }
      // For ALLOCATED path, remove REJECTED_BY_TPO if ALLOCATED is the next final
      if (allSteps[nextFinalIdx] === "ALLOCATED") {
        statusSteps = statusSteps.filter(
          step => step !== "REJECTED_BY_TPO"
        );
      }
    }
  }

  // 1. Determine the index of the last completed step
  let lastIdx = 0;
  if (history && history.length > 0) {
    lastIdx = statusSteps.findIndex(
      step => step === history[history.length - 1]?.status
    );
    if (lastIdx === -1) lastIdx = 0;
  }

  // 2. Map dates for display
  const statusDateMap = {};
  if (history) {
    history.forEach(h => {
      statusDateMap[h.status] = h.createdAt;
    });
  }

  return (
    <div className="w-full max-w-6xl mx-auto my-8 px-4 md:px-0 mb-4">
      <div className="flex flex-row items-center w-full">
        {/* Timeline Steps */}
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center w-full">
            {statusSteps.map((step, idx) => {
              const isLastStep = idx === statusSteps.length - 1;
              // ...existing code...
              const isAllocatedOrRejected = (step === "ALLOCATED" || step === "REJECTED") && idx === lastIdx;
              const isCompleted = idx < lastIdx || isAllocatedOrRejected;
              const isCurrent = idx === lastIdx && !isAllocatedOrRejected;
              const isPending = idx > lastIdx;
              // ...existing code...
              let circleBase = "w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold z-10 shrink-0 ";
              let circleStateClass = "";
              if (isCompleted) {
                  circleStateClass = "bg-red-600 border-2 border-red-600 text-white";
              } else if (isCurrent) {
                  circleStateClass = "bg-white border-[3px] border-red-600 text-red-600";
              } else {
                  circleStateClass = "bg-white border-2 border-gray-300 text-gray-300";
              }
              let lineColor = (idx < lastIdx) ? "bg-red-600" : "bg-gray-200";
              let horLineClass = `hidden md:block h-1 flex-1 ${lineColor}`;
              let vertLineClass = `md:hidden absolute top-8 left-4 w-1 h-full -ml-0.5 ${lineColor}`;
              return (
                <React.Fragment key={step}>
                  {/* STEP CONTAINER */}
                  <div className="relative flex flex-row md:flex-col items-start md:items-center md:shrink-0 pb-8 md:pb-0">
                    {/* VERTICAL LINE (Mobile Only) */}
                    {!isLastStep && <div className={vertLineClass}></div>}
                    {/* The Circle */}
                    <div className={circleBase + circleStateClass}>
                      {isCompleted ? <span>&#10003;</span> : null}
                    </div>
                    {/* LABELS (Text) - FIXED SECTION */}
                    <div className="ml-4 md:ml-0 md:absolute md:top-10 flex flex-col md:items-center w-auto md:w-max md:left-1/2 md:-translate-x-1/2">
                      <div className={
                        'text-xs uppercase font-bold text-left md:text-center mb-1 mr-0 md:!mr-12 md:whitespace-nowrap ' +
                        (isPending ? 'text-gray-400' : 'text-red-600')
                      }>
                        {step.replace(/_/g, ' ')}
                      </div>
                      <div className="text-[10px] text-gray-500 font-medium text-left mr-0 md:!mr-12 md:text-center">
                        {statusDateMap[step] 
                          ? new Date(statusDateMap[step]).toLocaleDateString() 
                          : ''}
                      </div>
                    </div>
                  </div>
                  {/* HORIZONTAL LINE (Desktop Only) */}
                  {!isLastStep && <div className={horLineClass}></div>}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Download Button: Only show if ALLOCATED is present */}
        {hasAllocated && (
        
          <div className="flex justify-center ml-4 md:ml-12">
            <button
              className="flex items-center h-9 gap-2 px-4 py-2 bg-red-500 text-white rounded shadow hover:bg-red-700 transition-colors"
              onClick={generateTrainingLetterPDF}
            >
              {/* SVG Icon: Document with Download Arrow */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-8m0 8l-3-3m3 3l3-3M6 20.25h12a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v12a2.25 2.25 0 002.25 2.25z" />
              </svg>
              Generate
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Timeline;