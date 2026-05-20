import React from "react";

const Navbar = ({ currentPath, onLogout, isOfficer }) => {
  const links = [
    { label: "Dashboard", to: "/claimservice/dashboard" },
    { label: "About", to: "/claimservice/about" },
  ];

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        <div className="flex items-center gap-4">
          <div className="text-lg font-bold text-indigo-600">LifeClaim 360</div>
          <nav className="hidden sm:flex items-center gap-2">
            {links.map((l) => {
              const active = currentPath === l.to;
              return (
                <a
                  key={l.to}
                  href={l.to}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${active ? "bg-indigo-600 text-white" : "text-gray-700 hover:bg-gray-50"}`}
                >
                  {l.label}
                </a>
              );
            })}

            {/* {isOfficer && (
              <a
                href="/claimservice/dashboard?view=officer"
                className={`px-3 py-2 rounded-md text-sm font-medium ${currentPath === "/claimservice/dashboard" ? "bg-indigo-600 text-white" : "text-gray-700 hover:bg-gray-50"}`}
              >Officer Dashboard
              </a>
            )} */}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="sm:hidden">
            {/* Simple stacked links on small screens */}
            <div className="flex flex-col text-sm">
              {links.map((l) => (
                <a key={l.to} href={l.to} className={`py-1 ${currentPath === l.to ? "text-indigo-600 font-semibold" : "text-gray-700"}`}>
                  {l.label}
                </a>
              ))}
              {/* {isOfficer && (
                <a href="/claimservice/dashboard?view=officer" className={`py-1 ${currentPath === "/claimservice/dashboard" ? "text-indigo-600 font-semibold" : "text-gray-700"}`}>
                  Officer Dashboard
                </a>
              )} */}
            </div>
          </div>

          <button
            onClick={onLogout}
            className="px-3 py-2 rounded-md text-sm font-medium bg-red-50 hover:bg-red-100 text-red-700 border border-red-100"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
