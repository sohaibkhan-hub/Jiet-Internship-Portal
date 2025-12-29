
import { useState } from "react";
import ErrorMessage from "../../components/ErrorMessage";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { useNavigate } from "react-router-dom";
import { loginAsync } from "../../store/slices/authSlice";
import backgroundImage from "../../assets/images/background.webp";

function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if(!formData.email || !formData.password) {
        setErrors({ general: 'Please fill in all required fields' });
        return;
      }
      setErrors({});
      await dispatch(loginAsync(formData)).unwrap();
      if(isAuthenticated && role) {
        switch(role) {
          case 'STUDENT':
            navigate('/student-dashboard');
            break;
          case 'FACULTY':
            navigate('/faculty-dashboard');
            break;
          case 'ADMIN':
            navigate('/admin-dashboard');
            break;
          default:
            navigate('/');
        }
      }
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="relative w-full max-w-[800px] h-[500px] bg-[#424242] shadow-[5px_25px_50px_rgba(158,158,158,1)] transition-all duration-500 hover:shadow-[5px_25px_50px_rgba(97,97,97,1)] flex overflow-hidden mx-4">
        {/* Image Box - Hidden on mobile */}
        <div className="hidden md:flex w-1/2 h-full bg-gradient-to-br from-[#FF0000] to-[#e7e7e7] items-center justify-center p-8 transition-all duration-500">
          <p className="text-white !text-7xl font-serif text-center drop-shadow-lg">
            JIET Internship Portal
          </p>
        </div>

        {/* Form Box */}
        <div className="w-full md:w-1/2 h-full bg-[#e7e7e7] flex items-center justify-center p-10 transition-all duration-500">
          <form onSubmit={handleSubmit} className="w-full">
            <div className="mb-4">

            </div>
            <h2 className="text-lg font-semibold text-left mb-2 text-[#FF0000]">
              Sign in here
            </h2>
            <input
              required
              type="email"
              value={formData.email}
              name="email"
              placeholder="Email"
              className="w-full p-2.5 bg-white text-black outline-1 my-2 font-medium text-xl rounded-xl focus:border-[#FF0000] focus:outline-none focus:ring-1 focus:ring-[#FF0000]"
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />

            <input
              required
              type="password"
              value={formData.password}
              name="password"
              placeholder="Password"
              className="w-full p-2.5 bg-white text-black outline-1 mt-2 font-medium text-xl rounded-xl focus:border-[#FF0000] focus:outline-none focus:ring-1 focus:ring-[#FF0000]"
              autoComplete="off"
              onChange={e => setFormData({ ...formData, password: e.target.value })}
            />

            {/* <select
              name="User_type"
              value={formData.User_type}
              onChange={e => setFormData({ ...formData, User_type: e.target.value })}
              className="w-full p-2.5 bg-white text-black outline-1 my-2 font-medium text-xl rounded-xl focus:border-[#FF0000] focus:outline-none focus:ring-1 focus:ring-[#FF0000]"
              id="exampleFormControlSelect1"
            >
              <option name="student" value="1">
                Student
              </option>
              <option name="faculty" value="2">
                Faculty
              </option>
              <option name="admin" value="3">
                Admin
              </option>
            </select> */}
            <p className="signup">
              {/* <a href="/forgotpassword">Forgot password?</a> */}
            </p>
            <div className="text-center relative z-10">
              <ErrorMessage err={errors.general} close={() => setErrors({ general: '' })} />
            </div>
            <div className=" mt-2 text-left">
              <button
                type="submit"
                name="loginBtn"
                className="w-full max-w-[100px] bg-[#FF0000] rounded-lg text-white cursor-pointer text-sm font-medium tracking-wider transition-all duration-500 hover:shadow-lg hover:text-black py-2"
              >
                Signin
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
