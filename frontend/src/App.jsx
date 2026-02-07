import React, { Fragment, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Navbar from "./layouts/Navbar";
import Loader from "./components/Loader";
import StudentDashboard from "./pages/dashboard/student/StudentDashboard";
import FacultyDashboard from "./pages/dashboard/faculty/FacultyDashboard";
import AdminDashboard from "./pages/dashboard/admin/AdminDashboard";
import NotFoundPage from "./pages/NotFound";
import { ToastContainer } from "react-toastify";
import Login from "./pages/auth/Login";
import { useAppDispatch, useAppSelector } from "./hooks/redux";
import { getCurrentUserAsync } from "./store/slices/authSlice";

function App() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, role, loading: authLoading } = useAppSelector((state) => state.auth);
  const { loading: companyLoading } = useAppSelector((state) => state.company);
  const { loading: branchDomainLoading } = useAppSelector((state) => state.domainBranch);
  const { loading: adminLoading } = useAppSelector((state) => state.admin);
  const { loading: studentLoading } = useAppSelector((state) => state.student);

  // Show loader if any loading state is true
  const isLoading = authLoading || companyLoading || branchDomainLoading || adminLoading || studentLoading;
  
  // On app load, check if user is authenticated
  useEffect(() => {
    if (isAuthenticated && role) {
      switch (role) {
        case 'STUDENT':
          navigate('/student-dashboard', { replace: true });
          break;
        case 'FACULTY':
          navigate('/faculty-dashboard', { replace: true });
          break;
        case 'ADMIN':
          navigate('/admin-dashboard', { replace: true });
          break;
        default:
          break;
      }
    }
  }, [isAuthenticated, user, navigate, role]);

  useEffect(() => {
    dispatch(getCurrentUserAsync());
  }, [dispatch]);

  return (
    <>
      <ToastContainer 
        position="top-center"  
        autoClose={3000}  
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        closeButton={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      {isLoading && <Loader />}
      <div className="">
        <Navbar />
        <Fragment>
          <main>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/student-dashboard" element={isAuthenticated && role === 'STUDENT' ? <StudentDashboard /> : <Login />} />
              <Route path="/faculty-dashboard" element={isAuthenticated && role === 'FACULTY' ? <FacultyDashboard /> : <Login />} />
              <Route path="/admin-dashboard" element={isAuthenticated && role === 'ADMIN' ? <AdminDashboard /> : <Login />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </Fragment>
      </div>
    </>
  );
}
export default App;
