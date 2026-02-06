function NavBar() {
  return (
    <nav className="w-full bg-primary shadow-lg">
      <div className="flex items-center justify-between h-16 px-4">
        <span className="text-background font-bold text-2xl">
          Villanova Institute for Research and Scholarship
        </span>
        <div className="flex items-center space-x-4">
          {/* Links will be added here */}
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
