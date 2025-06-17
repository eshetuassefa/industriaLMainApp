import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Header = ({ user, getInitials }) => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white text-black shadow-md z-50">
      <div className="container mx-auto px-4 p-2 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold">Receptionist Page</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Avatar className="h-10 w-10">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <AvatarFallback className="bg-blue-100 text-blue-700">
                  {getInitials(user.name)}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-gray-500">{user.role}</p>
              {user.email && (
                <p className="text-xs text-gray-400">{user.email}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
