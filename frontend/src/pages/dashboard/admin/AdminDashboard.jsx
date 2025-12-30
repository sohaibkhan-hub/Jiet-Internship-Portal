import React, { useState } from "react";
import Sidenav from "../../../components/Sidenav";
import { MdPermIdentity, MdAddCircle, MdDns, MdSettings, MdList, MdPersonAdd, MdDomain, MdDeviceHub, MdSchool, MdLock, MdBusiness, MdPeople, MdAssignment, MdViewList } from "react-icons/md";
import ChangePassword from "./ChangePassword";
import RegisterStudent from "./RegisterStudent";
import AddDomain from "./AddDomain";
import AddBranch from "./AddBranch";
import BranchList from "./BranchList";
import DomainList from "./DomainList";
import AdminProfile from "./AdminProfile";
import StudentApplicationList from "./StudentApplicationList";
import StudentList from "./StudentList";
import CompanyList from "../faculty/CompanyList";
import RegisterFaculty from "./RegisterFaculty";
import FacultyList from "./FacultyList";
import StudentProfileUpdate from "./StudentProfileUpdate";
import { BsListCheck } from "react-icons/bs";

const MENU_CONFIG = [
  {
    label: "Profile",
    icon: MdPermIdentity,
    key: "profile",
    component: AdminProfile,
  },
  {
    label: "Change Password",
    icon: MdLock,
    key: "changepwd",
    component: ChangePassword,
  },
  {
    label: "Company List",
    icon: MdBusiness,
    key: "companyList",
    component: CompanyList,
  },
  {
    label: "Register Student",
    icon: MdSchool,
    key: "registerStudent",
    component: RegisterStudent,
  },
  {
    label: "Register Faculty",
    icon: MdPersonAdd,
    key: "registerFaculty",
    component: RegisterFaculty,
  },
  {
    label: "Student Application",
    icon: MdAssignment,
    key: "studentApplicationList",
    component: StudentApplicationList,
  },
  // {
  //   label: "Add Domain",
  //   icon: MdDomain,
  //   key: "addDomain",
  //   component: AddDomain,
  // },
  // {
  //   label: "Add Branch",
  //   icon: MdDeviceHub,
  //   key: "addBranch",
  //   component: AddBranch,
  // },
  {
    label: "Branch List",
    icon: MdDeviceHub,
    key: "branchList",
    component: BranchList,
  },
  {
    label: "Domain List",
    icon: MdDomain,
    key: "domainList",
    component: DomainList,
  },
  {
    label: "Student List",
    icon: MdPeople,
    key: "studentList",
    component: StudentList,
  },
  {
    label: "Faculty List",
    icon: MdDns,
    key: "facultyList",
    component: FacultyList,
  },
  {
    label: "Update Student ",
    icon: BsListCheck,
    key: "updateStudent",
    component: StudentProfileUpdate,
  },
];

function AdminDashboard() {
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
        text="Admin Portal"
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

export default AdminDashboard;
