import { FaInfinity, FaUser, FaBriefcase, FaBuilding } from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import { logoutUserApiCall } from "../../API/api";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../redux/authSlice";
import { useState, useEffect } from "react";
import { RxHamburgerMenu } from "react-icons/rx";
import { HiMiniXMark } from "react-icons/hi2";
import { IoHome, IoSearch, IoInformationCircle, IoMail, IoLogOut, IoPersonCircle, IoChevronDown } from "react-icons/io5";

export const Navbar = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const user = useSelector((state) => state.auth.user);
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
    setShowProfileDropdown(false);
  }, [navigate]);

  const handleOpenBoxClick = () => {
    setIsOpen(!isOpen);
    setShowProfileDropdown(false);
  };

  const handleLogout = async () => {
    try {
      const response = await logoutUserApiCall();
      if (response.data.success) {
        localStorage.clear();
        Cookies.remove("token");
        dispatch(logoutUser());
        toast.success(response?.data.message);
        setIsOpen(false);
        setShowProfileDropdown(false);
        navigate('/');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  const handleProfile = () => {
    navigate("/profile");
    setIsOpen(false);
    setShowProfileDropdown(false);
  };

  // Navigation items for different user roles
  const getNavigationItems = () => {
    if (user?.role === "recruiter") {
      return [
        { path: "/companies", label: "Companies", icon: <FaBuilding className="w-4 h-4" /> },
        { path: "/jobs", label: "Jobs", icon: <FaBriefcase className="w-4 h-4" /> }
      ];
    }
    return [
      { path: "/", label: "Home", icon: <IoHome className="w-4 h-4" /> },
      { path: "/findJob", label: "Find Jobs", icon: <IoSearch className="w-4 h-4" /> },
      { path: "/about", label: "About", icon: <IoInformationCircle className="w-4 h-4" /> },
      { path: "/contact", label: "Contact", icon: <IoMail className="w-4 h-4" /> }
    ];
  };

  const navigationItems = getNavigationItems();

  return (
    <>
      {/* Navigation Bar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-white/80 backdrop-blur-xl shadow-lg border-b border-white/20' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            
            {/* Logo Section */}
            <div className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative bg-blue-500 p-2 rounded-xl">
                  <FaInfinity className="text-white text-xl group-hover:rotate-180 transition-transform duration-500" />
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold bg-blue-600 bg-clip-text text-transparent">
                  Zipjob
                </h1>
                <p className="text-xs text-gray-500 -mt-1">Find Your Future</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                      isActive
                        ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                        : 'text-gray-700 hover:bg-white/50 hover:text-blue-600 hover:shadow-md'
                    }`
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>

            {/* Desktop Auth Section */}
            <div className="hidden lg:flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="flex items-center space-x-3 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                     <img src={user.profile.profileImg} alt="" className="w-10 h-10 rounded-full object-cover" />
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-800 truncate max-w-32">
                        {user?.name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">{user?.role || 'user'}</p>
                    </div>
                    <IoChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                      showProfileDropdown ? 'rotate-180' : ''
                    }`} />
                  </button>

                  {/* Profile Dropdown */}
                  {showProfileDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                           <img src={user.profile.profileImg} alt="" className="w-12 h-12 rounded-full object-cover" />
                          <div>
                            <h3 className="font-semibold text-gray-800">{user?.fullname}</h3>
                            <p className="text-sm text-gray-500">{user?.email}</p>
                            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mt-1 capitalize">
                              {user?.role}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-2">
                        <button
                          onClick={handleProfile}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all duration-200"
                        >
                          <IoPersonCircle className="w-5 h-5" />
                          <span>View Profile</span>
                        </button>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                        >
                          <IoLogOut className="w-5 h-5" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <NavLink
                    to="/login"
                    className="px-6 py-2 text-gray-700 font-medium hover:text-blue-600 transition-colors duration-200"
                  >
                    Login
                  </NavLink>
                  <NavLink
                    to="/register"
                    className="px-6 py-2 bg-blue-600 text-white font-medium rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    Get Started
                  </NavLink>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button
                onClick={handleOpenBoxClick}
                className="p-2 bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isOpen ? (
                  <HiMiniXMark className="text-2xl text-gray-700" />
                ) : (
                  <RxHamburgerMenu className="text-2xl text-gray-700" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-white/20 shadow-2xl animate-in slide-in-from-top-2 duration-300">
            <div className="max-w-7xl mx-auto px-4 py-6">
              
              {/* Mobile Navigation Links */}
              <div className="space-y-2 mb-6">
                {navigationItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-500 text-white'
                          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                      }`
                    }
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>

              {/* Mobile Auth Section */}
              <div className="border-t border-gray-200 pt-6">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 rounded-xl">
                     <img src={user.profile.profileImg} alt="" className="w-12 h-12 rounded-full object-cover" />
                      <div>
                        <p className="font-semibold text-gray-800">{user?.fullname}</p>
                        <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleProfile}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all duration-200"
                    >
                      <IoPersonCircle className="w-5 h-5" />
                      <span>View Profile</span>
                    </button>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-left text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all duration-200"
                    >
                      <IoLogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <NavLink
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="block w-full px-4 py-3 text-center text-gray-700 font-medium border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200"
                    >
                      Login
                    </NavLink>
                    <NavLink
                      to="/register"
                      onClick={() => setIsOpen(false)}
                      className="block w-full px-4 py-3 text-center text-white font-medium bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:shadow-lg transition-all duration-200"
                    >
                      Get Started
                    </NavLink>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Spacer to prevent content from hiding behind fixed navbar */}
      <div className="h-16 lg:h-20"></div>
    </>
  );
};