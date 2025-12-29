import HeaderProfile from "../../../components/HeaderProfile";
import { useAppSelector } from "../../../hooks/redux";

function AdminProfile() {

  const { user } = useAppSelector((state) => state.auth);
  
  return (
    <div className="flex bg-gradient-to-br from-gray-100 via-white to-gray-200 min-h-[100vh]">
      <section className="flex-1 flex flex-col px-0 md:px-0 w-full max-w-7xl mx-auto">
        <HeaderProfile />
        {/* Main Content (Profile Details Form) */}
        <div className="w-full max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center">
            <form id="form" className="w-full space-y-8">
              <h3 className="text-xl font-semibold !text-gray-700 mb-4 border-b pb-2">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="fullName" className="block text-gray-700 font-semibold mb-1">Full Name</label>
                  <input
                    readOnly
                    type="text"
                    name="fullName"
                    id="fullName"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF0000] bg-gray-50"
                    placeholder={user?.profile?.fullName}
                    defaultValue={user?.profile?.fullName}
                    disabled
                  />
                </div>
                <div>
                  <label htmlFor="designation" className="block text-gray-700 font-semibold mb-1">Designation</label>
                  <input
                    readOnly
                    type="text"
                    name="designation"
                    id="designation"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF0000] bg-gray-50"
                    placeholder={user?.profile?.designation}
                    defaultValue={user?.profile?.designation}
                    disabled
                  />
                </div>
                <div>
                  <label htmlFor="department" className="block text-gray-700 font-semibold mb-1">Department</label>
                  <input
                    readOnly
                    type="text"
                    name="department"
                    id="department"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF0000] bg-gray-50"
                    placeholder={user?.profile?.branch?.name}
                    defaultValue={user?.profile?.branch?.name}
                    disabled
                  />
                </div>
                <div>
                  <label htmlFor="phoneNumber" className="block text-gray-700 font-semibold mb-1">Phone Number</label>
                  <input
                    readOnly
                    type="tel"
                    name="phoneNumber"
                    id="phoneNumber"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF0000] bg-gray-50"
                    placeholder={user?.profile?.phoneNumber}
                    defaultValue={user?.profile?.phoneNumber}
                    disabled
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-gray-700 font-semibold mb-1">Email</label>
                  <input
                    readOnly
                    type="email"
                    name="email"
                    id="email"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF0000] bg-gray-50"
                    placeholder={user?.profile?.email}
                    defaultValue={user?.profile?.email}
                    disabled
                  />
                </div>
                <div>
                  <label htmlFor="employeeId" className="block text-gray-700 font-semibold mb-1">Employee ID</label>
                  <input
                    readOnly
                    type="text"
                    name="employeeId"
                    id="employeeId"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF0000] bg-gray-50"
                    placeholder={user?.profile?.employeeId}
                    defaultValue={user?.profile?.employeeId}
                    disabled
                  />
                </div>
                <div>
                  <label htmlFor="programType" className="block text-gray-700 font-semibold mb-1">Program Type</label>
                  <input
                    readOnly
                    type="text"
                    name="programType"
                    id="programType"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF0000] bg-gray-50"
                    placeholder={user?.profile?.branch?.programType}
                    defaultValue={user?.profile?.branch?.programType}
                    disabled
                  />
                </div>
                <div>
                  <label htmlFor="dateOfBirth" className="block text-gray-700 font-semibold mb-1">Date of Birth</label>
                  <input
                    readOnly
                    type="date"
                    name="dateOfBirth"
                    id="dateOfBirth"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF0000] bg-gray-50"
                    placeholder={user?.profile?.dateOfBirth}
                    defaultValue={user?.profile?.dateOfBirth}
                    disabled
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AdminProfile;
