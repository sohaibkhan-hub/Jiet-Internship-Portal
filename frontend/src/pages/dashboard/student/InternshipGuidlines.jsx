import HeaderProfile from "../../../components/HeaderProfile";

function InternshipGuidelines() {
  const data = {
    email: "student143@example.com",
    fullName: "Student One",
    rollNumber: "567464",
    registrationNumber: "RE7867G123",
    fatherName: "Father Name",
    dateOfBirth: "2000-01-01",
    phoneNumber: "9876543210",
    branchId: "69495080124d1c7ae8827b95",
    year: "2",
  };

  return (
    <div className="flex bg-gradient-to-br from-gray-100 via-white to-gray-200 min-h-[calc(100vh-5rem)]">
      {/* Main Content */}
      <section className="w-full max-w-7xl mx-auto px-0 md:px-0">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-12 p-0 md:p-0">
          <HeaderProfile data={data} />
          <div className="mt-8 pb-8">
            {/* Page Title */}
            <h3 className="text-xl font-semibold !text-gray-700 mb-2 border-b pb-2 px-6 md:px-0">
              Internship Guidelines for Students
            </h3>
            <p className="text-sm text-gray-700 mb-6 px-6 md:px-0">
              Internship is great opportunity to learn in industry environment
              without being an employee of company. Students are advised to
              set their goals prior to starting their internship and focus on
              completing them during internship.
            </p>
            <div className="px-2">
              <h4 className="text-lg font-semibold text-gray-800 mb-2 px-6 md:px-0">
                Following are internship guidelines for students:
              </h4>
              <ol className="list-decimal ml-8">
                <li className="text-gray-800 text-base mb-2">Internship may be full time or part time.</li>
                <li className="text-gray-800 text-base mb-2">Internship may be paid or unpaid.</li>
                <li className="text-gray-800 text-base mb-2">
                  Internship duration is including vacation period as follows:
                  <ul className="list-disc ml-6 mt-1">
                    <li className="text-base mb-1">Maximum of 2 months: for UG after 6th semester.</li>
                    <li className="text-base">Maximum of 1.5 months: for UG after 2nd and 4th semester.</li>
                  </ul>
                </li>
                <li className="text-red-600 text-base font-semibold mb-2">
                  Eligibilty criteria: Minimum 75% attendance is compulsory and more than 7 CGPA in previous consecutive years.
                </li>
                <li className="text-red-600 text-base font-semibold mb-2">
                  After completing the internship, certificate of completion will have to be uploaded on the portal.
                </li>
                <li className="text-gray-800 text-base mb-2">No student will be permitted for internship without prior permission of institute.</li>
                <li className="text-gray-800 text-base mb-2">The intern will demonstrate punctuality and a willingness to learn during internship programme.</li>
                <li className="text-gray-800 text-base mb-2">The intern will obey policies, rules and regulations of the company/institute and comply with the institute's/company's business practices and procedures.</li>
                <li className="text-gray-800 text-base">The intern will maintain a regular internship schedule determined by the institute or company.</li>
              </ol>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default InternshipGuidelines;
