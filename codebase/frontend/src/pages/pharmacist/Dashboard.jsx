import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card";
import { Loader2 } from "lucide-react";

const Dashboard = ({
  prescriptions = [],
  drugs = [],
  patients = [],
  activityLog = [],
  loadingStates = { prescriptions: false, drugs: false, patients: false },
  onViewPrescriptions,
}) => {
  // Filter prescriptions for today with safety check
  const today = new Date().toISOString().split("T")[0];
  const todaysPrescriptions = prescriptions.filter((p) => {
    const dateFields = ["createdAt", "deliveredAt", "updatedAt"];
    const validDate = dateFields
      .map((field) => p[field])
      .find((date) => date && new Date(date).toISOString()); // Find first valid date
    const prescriptionDate = validDate
      ? new Date(validDate).toISOString().split("T")[0]
      : null;
    return prescriptionDate === today;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Today's Prescriptions Card */}
      <Card
        className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
        onClick={onViewPrescriptions}
      >
        <CardHeader className="bg-gray-500 from-blue-500 to-indigo-600 text-white p-4 rounded-t-lg">
          <CardTitle className="text-xl font-bold">
            Today's Prescriptions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {loadingStates.prescriptions ? (
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-3xl font-semibold text-gray-800">
                {todaysPrescriptions.length}
              </p>
              <p className="text-gray-600">Prescriptions today</p>
              <div className="mt-4">
                <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                  Click to view
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Total Drugs Card */}
      <Card className="bg-white shadow-lg">
        <CardHeader className="bg-gray-500  from-green-500 to-teal-600 text-white p-4 rounded-t-lg">
          <CardTitle className="text-xl font-bold">Total Drugs</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {loadingStates.drugs ? (
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-3xl font-semibold text-gray-800">
                {drugs.length}
              </p>
              <p className="text-gray-600">Drugs in inventory</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Total Patients Card */}
      <Card className="bg-white shadow-lg">
        <CardHeader className="bg-gray-500  from-purple-500 to-pink-600 text-white p-4 rounded-t-lg">
          <CardTitle className="text-xl font-bold">Total Patients</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {loadingStates.patients ? (
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-3xl font-semibold text-gray-800">
                {patients.length}
              </p>
              <p className="text-gray-600">Registered patients</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity Card */}
      <Card className="bg-white shadow-lg col-span-1 md:col-span-2 lg:col-span-3">
        <CardHeader className="bg-gradient-to-r from-gray-500 to-gray-700 text-white p-4 rounded-t-lg">
          <CardTitle className="text-xl font-bold">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {loadingStates.prescriptions || loadingStates.drugs ? (
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
            </div>
          ) : activityLog.length === 0 ? (
            <p className="text-center text-gray-500">No recent activity</p>
          ) : (
            <ul className="space-y-2">
              {activityLog.slice(0, 5).map((log) => (
                <li key={log.id} className="text-gray-700">
                  {log.action} - {log.time}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
