import React, { useState } from "react";
import Sidenav from "../../../components/Sidenav";
import FacultyProfile from "./FacultyProfile";
import { MdPermIdentity, MdAddCircle, MdDns, MdSettings, MdLock, MdBusiness, MdPersonAdd, MdList } from "react-icons/md";
import AddCompany from "./AddCompany";
import ChangePassword from "../admin/ChangePassword";
import CompanyList from "./CompanyList";

const MENU_CONFIG = [
  {
    label: "Profile",
    icon: MdPermIdentity,
    key: "profile",
    component: FacultyProfile,
  },
  {
    label: "Change Password",
    icon: MdLock,
    key: "changepwd",
    component: ChangePassword,
  },
  {
    label: "Add Company",
    icon: MdBusiness,
    key: "company",
    component: AddCompany,
  },
  {
    label: "Company List",
    icon: MdList,
    key: "companyList",
    component: CompanyList,
  }
];

function FacultyDashboard() {
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

  // Responsive margin: on small screens, margin-left 64px if collapsed, 0 if open; on md+, 64px or 256px
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
        text="Faculty Portal"
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

export default FacultyDashboard;
