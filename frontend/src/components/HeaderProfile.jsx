import { useAppSelector } from "../hooks/redux";


const HeaderProfile = () => {
  const { user, role } = useAppSelector((state) => state.auth);
  
  return (
    <div className="w-full"> 
   {/* Top Red Header with Avatar and Info */}
        <div className="relative w-full bg-[#EF5350] h-36 flex items-center pl-24 md:pl-56">
          {/* Avatar - Overlapping */}
          <div className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-16 h-16 md:w-28 md:h-28 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
            {/* SVG Avatar */}
            <svg className="w-24 h-24 text-red-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 19.5a7.5 7.5 0 1115 0v.75A2.25 2.25 0 0117.25 22.5h-10.5A2.25 2.25 0 014.5 20.25V19.5z" />
            </svg>
          </div>
          {/* Name and Year */}
          <div className="flex flex-col justify-center text-white">
            <span className="text-2xl font-bold leading-tight">{user.profile.fullName}</span>
            <span className="text-base font-normal opacity-90 mt-1">{role === 'STUDENT' ? `${user.profile.year} Year Student` : `${user?.user?.email}`}</span>
          </div>
        </div>
    </div>
  );
};

export default HeaderProfile;