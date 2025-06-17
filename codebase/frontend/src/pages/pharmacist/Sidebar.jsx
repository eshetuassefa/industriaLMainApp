// src/components/pharmacist/Sidebar.js
import {
  ArchiveBoxIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  BellIcon,
} from "@heroicons/react/24/outline";
import { Pill, ClipboardList, Package, BarChart3, Users } from "lucide-react";

export default function Sidebar({ activeTab, setActiveTab }) {
  const navigation = [
    { name: "Dashboard", value: "dashboard", icon: Pill },
    { name: "Prescriptions", value: "prescriptions", icon: ClipboardList },
    { name: "Dispensing", value: "dispensing", icon: Package },
    { name: "Inventory", value: "inventory", icon: ArchiveBoxIcon },
    { name: "Reports", value: "reports", icon: BarChart3 },
    { name: "Patients", value: "patients", icon: Users },
  ];

  return (
    <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-60 bg-white border-r border-gray-200 z-10">
      <nav className="h-full overflow-y-auto">
        <ul className="p-4 space-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <button
                onClick={() => setActiveTab(item.value)}
                className={`w-full py-2.5 px-4 text-left rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-3 ${
                  activeTab === item.value
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
