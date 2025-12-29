import React from "react";

function Timeline({history}) {
  // Define the status steps here (was previously on the class)
  const statusSteps = [
    "NOT_APPLIED",
    "SUBMITTED",
    "PENDING_REVIEW",
    "APPROVED_BY_TPO",
    "REJECTED_BY_TPO",
    "ALLOCATED",
    "REJECTED"
  ];

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
    <div className="flex flex-col md:flex-row md:items-center w-full max-w-6xl mx-auto my-8 px-16 md:px-0 mb-4">
      {statusSteps.map((step, idx) => {
        const isLastStep = idx === statusSteps.length - 1;
        
        // Logic for state
        const isCompleted = idx < lastIdx;
        const isCurrent = idx === lastIdx;
        const isPending = idx > lastIdx;

        // --- STYLES ---
        
        // 1. Circle Styles
        let circleBase = "w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold z-10 shrink-0 ";
        
        let circleStateClass = "";
        if (isCompleted) {
            circleStateClass = "bg-red-600 border-2 border-red-600 text-white";
        } else if (isCurrent) {
            circleStateClass = "bg-white border-[3px] border-red-600 text-red-600";
        } else {
            circleStateClass = "bg-white border-2 border-gray-300 text-gray-300";
        }

        // 2. Line Styles
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
              {/* Changes made:
                  1. md:w-max -> Allows width to grow to fit text
                  2. md:whitespace-nowrap -> Prevents text from breaking into two lines
              */}
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
  );
}

export default Timeline;