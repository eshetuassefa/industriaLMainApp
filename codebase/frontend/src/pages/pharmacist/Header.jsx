import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Header = ({ user }) => {
  const getInitials = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white text-black shadow-md z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold">Pharmacist Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Avatar className="h-10 w-10">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <AvatarFallback className="bg-blue-100 text-blue-700">
                  {getInitials(user?.name || "")}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <p className="font-medium">{user?.name || "User"}</p>
              <p className="text-sm text-gray-500">{user?.role || "Pharmacist"}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
