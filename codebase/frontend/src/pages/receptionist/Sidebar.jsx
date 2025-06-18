import { Building2, UserCircle } from "lucide-react";

const Sidebar = ({ activeTab, setActiveTab }) => {
  const tabs = [
    // { value: "dashboard", label: "Dashboard", icon: Building2 },
    { value: "patients", label: "Patients", icon: UserCircle },
  ];

  return (
    <div className="fixed left-0 top-16 h-[calc(100vh-5rem)] w-60 bg-gray-800 border-r border-gray-200 z-10 overflow-y-auto">
      <div className="flex flex-col gap-1 p-4">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`w-full py-3 px-4 text-left rounded-md text-base font-medium transition-colors hover:bg-gray-100 flex items-center gap-2 ${
              activeTab === tab.value
              ? "bg-white text-gray-900 hover:bg-gray-100"
              : "text-white hover:bg-gray-500"
            }`}
          >
            <tab.icon className="h-5 w-5" />
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
