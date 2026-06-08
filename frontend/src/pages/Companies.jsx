import { ArrowDownWideNarrow, ArrowUpWideNarrow, DeleteIcon, EditIcon, EllipsisVertical, PlusIcon, SearchIcon, ViewIcon } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import {useGetAllCompanies} from '../hooks/useGetAllCompanies'
import { useSelector } from "react-redux";
import { MenuButton } from "./company/MenuButton";
import {CompanyCard} from "./company/CompanyCard"
import { useNavigate } from "react-router-dom";

export const Companies = () => {
  const [activeMenu, setActiveMenu] = useState(null);
  const [filterValue, setFilterValue] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [viewMode, setViewMode] = useState("table"); // table or grid
  const menuRef = useRef(null);
 const navigate =useNavigate();
  
    useGetAllCompanies();
  const { companies } = useSelector((store) => store.company);
console.log(companies)

  const handleNavigate = () => {
    navigate("/companies/create")
  };

  const handleEdit = (id) => {
    navigate(`/companies/update/profile/${id}`)
  };


  const handleDelete = (id) => {
     navigate("")
    console.log(`Delete company with id: ${id}`);
  };

  const toggleMenu = (id) => {
    setActiveMenu(activeMenu === id ? null : id);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuOptions = [
       {
      menuName: "Edit Company",
      handler: handleEdit,
      icon: <EditIcon className="w-4"/>
    },
    {
      menuName: "Delete",
      handler: handleDelete,
      icon: <DeleteIcon className="w-4" />
    }
  ];

  const filteredCompanies = companies
    .filter((company) =>
      company?.companyName?.toLowerCase().includes(filterValue.toLowerCase())
    )
    .sort((a, b) => {
      let aValue = sortBy === "name" ? a.companyName : a.createdAt;
      let bValue = sortBy === "name" ? b.companyName : b.createdAt;
      
      if (sortBy === "date") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "short", 
      day: "numeric" 
    });
  };

 
  return (
    <section>
      <div>
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Companies</h1>
              <p className="text-gray-600">Manage your company listings and profiles</p>
            </div>
            <button
              onClick={handleNavigate}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <PlusIcon />
              New Company
            </button>
          </div>

          {/* Filters and Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search companies..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50 focus:bg-white transition-all duration-200"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
              />
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
              >
                <option value="name">Sort by Name</option>
                <option value="date">Sort by Date</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="p-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200"
              >
      
                {sortOrder === "asc" ?<ArrowUpWideNarrow />:<ArrowDownWideNarrow />}
                
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("table")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  viewMode === "table" 
                    ? "bg-white text-blue-600 shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  viewMode === "grid" 
                    ? "bg-white text-blue-600 shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Grid
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-600">
            Showing {filteredCompanies.length} of {companies.length} companies
          </p>
        </div>

        {/* Content */}
        {filteredCompanies.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No companies found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search criteria or create a new company.</p>
            <button
              onClick={handleNavigate}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors duration-200"
            >
              <PlusIcon />
              Create First Company
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <CompanyCard key={company._id} company={company} activeMenu={activeMenu} menuOptions={menuOptions} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left font-semibold text-gray-900 p-4">Company</th>
                    <th className="text-left font-semibold text-gray-900 p-4">Location</th>
                    <th className="text-left font-semibold text-gray-900 p-4">Created</th>
                    <th className="text-left font-semibold text-gray-900 p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompanies.map((company) => (
                    <tr
                      key={company._id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={company.logo}
                            alt={`${company.companyName} logo`}
                            className="w-10 h-10 rounded-lg object-cover"
                           
                          />
                          <div>
                            <div className="font-medium text-gray-900">
                              {company.companyName || "No Name"}
                            </div>
                            <div className="text-sm text-gray-500 line-clamp-1">
                              {company.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600">{company.location}</td>
                      <td className="p-4 text-gray-600">{formatDate(company.createdAt)}</td>
                      <td className="p-4">
                        <div className="relative" ref={activeMenu === company._id ? menuRef : null}>
                          <button
                            onClick={() => toggleMenu(company._id)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                          >
                           <EllipsisVertical />
                          </button>
                          <MenuButton
                            menu={activeMenu === company._id}
                            menuOptions={menuOptions}
                            id={company._id}
                            onClose={() => setActiveMenu(null)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
