const Navbar = () => {
  return (
    <nav className="w-full flex justify-between items-center py-4 px-8 bg-rose-50">
      <h1 className="text-xl font-bold">Educational Pathway Advisor</h1>
      <div className="space-x-6">
        <a href="/" className="text-gray-700 hover:text-black">Home</a>
        <a href="/dashboard" className="text-gray-700 hover:text-black">Services</a>
        <a href="#" className="text-gray-700 hover:text-black">Contact Us</a>
      </div>
    </nav>
  );
};

export default Navbar;