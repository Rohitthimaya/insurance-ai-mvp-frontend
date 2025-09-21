interface NavbarProps {
  loggedIn: boolean;
  onLogout: () => void;
}

export default function Navbar({ loggedIn, onLogout }: NavbarProps) {
  return (
    <nav className="flex justify-between items-center p-4 shadow-md">
      <h1 className="text-2xl font-bold text-blue-600">InsurEz</h1>
      <div className="space-x-4">
        {!loggedIn && (
          <span className="hover:text-blue-600 cursor-pointer">Login</span>
        )}
        {loggedIn && (
          <span
            className="hover:text-blue-600 cursor-pointer"
            onClick={onLogout}
          >
            Logout
          </span>
        )}
      </div>
    </nav>
  );
}
