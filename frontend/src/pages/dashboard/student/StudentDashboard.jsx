import React, { useState } from "react";
import Sidenav from "../../../components/Sidenav";
import ApplicationStatus from "./ApplicationStatus";
import CompanyChoice from "./ApplyCompany";
import ChangePassword from "../admin/ChangePassword";
import StudentProfile from "./StudentProfile";
import UpdateDomain from "./updateDomain";
import InternshipGuidelines from "./InternshipGuidlines";
import { MdPermIdentity, MdAddCircle, MdDns, MdSettings } from "react-icons/md";
import { BsListCheck } from "react-icons/bs";

const MENU_CONFIG = [
  {
    label: "Profile",
    icon: MdPermIdentity,
    key: "profile",
    component: StudentProfile,
  },
  {
    label: "My Applications",
    icon: MdDns,
    key: "application",
    component: ApplicationStatus,
  },
  {
    label: "Update Domains",
    icon: MdDns,
    key: "domain",
    component: UpdateDomain,
  },
  {
    label: "Apply Company",
    icon: MdAddCircle,
    key: "company",
    component: CompanyChoice,
  },
  {
    label: "Change Password",
    icon: MdSettings,
    key: "changepwd",
    component: ChangePassword,
  },
  {
    label: "Internship Guidelines",
    icon: BsListCheck,
    key: "guidelines",
    component: InternshipGuidelines,
  },
];

function StudentDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [activePage, setActivePage] = useState(MENU_CONFIG[0].key);

  const handleToggle = () => setCollapsed((prev) => !prev);
  const handleNav = (navKey) => {
    // navKey is now the same as the page key
    setActivePage(navKey);
  };

  // For highlighting
  const navKey = activePage;
  const menuItems = MENU_CONFIG.map(({ label, icon, key }) => ({ label, icon, key }));
  const ActiveComponent = MENU_CONFIG.find((item) => item.key === activePage)?.component;

  // Responsive margin: on small screens, margin-left 64px if collapsed, 0 if open; on md+, 64px or 272px
  const getMarginLeft = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 768) {
        return collapsed ? 64 : 0;
      } else {
        return collapsed ? 64 : 272;
      }
    }
    // fallback for SSR
    return 0;
  };

  const [marginLeft, setMarginLeft] = useState(getMarginLeft());

  React.useEffect(() => {
    function handleResize() {
      setMarginLeft(getMarginLeft());
    }
    window.addEventListener('resize', handleResize);
    // update on collapsed change
    setMarginLeft(getMarginLeft());
    return () => window.removeEventListener('resize', handleResize);
  }, [collapsed]);

  return (
    <div className="relative min-h-[100vh] bg-gradient-to-br from-gray-100 via-white to-gray-200">
      <Sidenav
        activeComponent={navKey}
        collapsed={collapsed}
        onToggle={handleToggle}
        onNav={handleNav}
        menuItems={menuItems}
        text="Student Portal"
      />
      <div
        className="flex-1 p-0 md:p-4 transition-all duration-300"
        style={{ marginLeft }}
      >
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
}

export default StudentDashboard;
