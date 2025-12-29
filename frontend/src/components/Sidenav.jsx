import { useState } from "react";

function Sidenav({ activeComponent, collapsed: collapsedProp, onToggle, onNav, menuItems, text }) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const collapsed = collapsedProp !== undefined ? collapsedProp : internalCollapsed;
  const handleToggle = onToggle || (() => setInternalCollapsed((prev) => !prev));
  const activeNow = activeComponent;

  return (
    <aside
      className={`!fixed left-0 !top-20 !h-[calc(100vh-5rem)] bg-gradient-to-br from-[#FF0000] to-[#e7e7e7] text-white flex flex-col items-center py-4 px-2 z-50
        ${collapsed ? "w-16 min-w-[4rem]" : "w-64 min-w-[16rem] px-4"}
        shadow-xl rounded-r-3xl transition-all duration-300
        sm:relative sm:${collapsed ? "w-16 min-w-[4rem]" : "w-20 min-w-[5rem] px-2"} sm:top-0 sm:h-screen
        md:relative md:${collapsed ? "w-16 min-w-[4rem]" : "w-64 min-w-max px-8"} md:top-0 md:h-screen
      `}
    >
      <div className={`w-full flex flex-col items-center justify-center mb-2 pt-2 pb-1 border-b border-white/20 ${collapsed ? "px-0" : "px-2"}`}>
        {!collapsed ? (
          <>
            <h4 className="text-4xl font-extrabold text-white drop-shadow-lg tracking-tight mb-1">{text}</h4>
            <p className="text-[#FFB4B4] font-semibold text-lg tracking-wide">Menu</p>
          </>
        ) : <p className="text-[#FFB4B4] font-semibold text-base tracking-wide">Menu</p>}
      </div>
      <ul className={`w-full flex-1 ${collapsed ? "space-y-2 pt-2" : "space-y-6 pt-2"} overflow-y-auto`}>
        {menuItems.map((item) => {
          const IconComp = item.icon;
          return (
            <li
              key={item.key}
              className={`flex items-center ${collapsed ? "justify-center" : "px-2 my-2 py-1"} rounded-xl cursor-pointer transition-colors font-semibold ${
                activeNow === item.key
                  ? "bg-white text-[#FF0000] shadow"
                  : "text-white/80 hover:bg-white hover:text-[#FF0000]"
              } ${collapsed ? "h-12 w-full" : "text-base md:text-lg"}`}
              style={collapsed ? { minHeight: "3rem" } : {}}
              onClick={() => onNav && onNav(item.key)}
            >
              <IconComp className={`${collapsed ? "text-2xl" : "text-2xl mr-3"} transition-all duration-200`} />
              {!collapsed && item.label}
            </li>
          );
        })}
      </ul>
      <button
        onClick={handleToggle}
        className={`fixed rounded text-[#FF0000] font-extralight z-50 hover:bg-white/90 transition-all duration-200 bottom-4 left-4 md:left-3`}
        aria-label={collapsed ? "Expand menu" : "Collapse menu"}
        style={{ position: "fixed" }}
      >
        {collapsed ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-10 md:w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" /></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-10 md:w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 12L6 6" /></svg>
        )}
      </button>
    </aside>
  );
}

export default Sidenav;
