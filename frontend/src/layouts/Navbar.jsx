import { Link, useNavigate } from "react-router-dom";
import { logoutAsync } from "../store/slices/authSlice";
import { useAppDispatch, useAppSelector } from "../hooks/redux";

const Navbar = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await dispatch(logoutAsync()).unwrap();
      navigate('/');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <header className="w-full bg-white border-b sticky top-0 z-90 shadow-sm">
        <div className="flex w-full px-8 items-center justify-between h-20">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center h-18 w-18 rounded-md bg-white">
                <img src="/logo.jpg" alt="JIET Logo" className="h-18 w-18 object-contain" />
              </span>
              <div>
                <div className="text-2xl underline-none font-bold text-gray-700">JIET</div>
                <div className="text-md text-gray-600">Universe</div>
              </div>
            </Link>
          </div>

          <div className="flex">
            {isAuthenticated ? (
                <button onClick={handleLogout} className="text-lg font-semibold !rounded-xl px-8 py-1.5 bg-[#FF0000] text-white hover:bg-red-600">Logout</button>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/" className="text-lg font-semibold rounded-xl outline-[#FF0000] outline-2 text-[#FF0000]">
                    <button className="px-8 py-1.5 rounded text-[#FF0000] hover:bg-red-100">Login</button>
                </Link>
              </div>
            )}
          </div>
        </div>
    </header>
  );
};

export default Navbar;
