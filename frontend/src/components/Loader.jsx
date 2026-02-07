import React from "react";

const Loader = () => (
  <div className="fixed inset-0 z-80 flex items-center justify-center bg-white bg-opacity-70">
    <div className="w-16 h-16 border-4 border-red-500 border-dashed rounded-full animate-spin"></div>
  </div>
);

export default Loader;
