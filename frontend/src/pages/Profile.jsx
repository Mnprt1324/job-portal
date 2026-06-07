import { useState } from "react";
import {
  Edit3,
  MapPin,
  Mail,
  Briefcase,
  Calendar,
  Award,
  TrendingUp,
  Download,
  Eye,
  Camera,
  User,
  Upload,
} from "lucide-react";
import { QuickActionsCard } from "./Profile/QuickActionsCard";
import { ContactInfoCard } from "./Profile/ContactInfoCard";
import { StatCard } from "./Profile/StatCard";
import { OverviewTab } from "./Profile/OverviewTab";
import { ProfileCompletionCard } from "./Profile/ProfileCompletionCard";
import { useSelector } from "react-redux";
import { ApplicationsTab } from "./Profile/ApplicationsTab";
import { SkillsTab } from "./Profile/SkillsTab";
import { ProfileUpdate } from "../components/ProfileUpdate";
import { ResumeUploadExample } from "./Profile/ResumeUploadDialog ";

export const Profile = () => {
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const user = useSelector((store) => store.auth.user);
  console.log(user);

   const handleDownload = () => {
    if (user.profile?.resume) {
      const downloadUrl = user.profile.resume.replace("/upload/", "/upload/fl_attachment/");
      window.open(downloadUrl, "_blank");
    }
  };


  const profileStats = {
    profileViews: 124,
    applicationsSent: 1,
    interviewsScheduled: 2,
    profileCompletion: calculateProfileCompletion(user),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Profile Image */}
            <div className="relative">
              <img
                src={
                  user?.profile?.profileImg || "https://via.placeholder.com/120"
                }
                alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
              />
              <button className="absolute bottom-2 right-2 p-2 bg-white text-blue-600 rounded-full shadow-lg hover:bg-gray-50 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <h1 className="text-3xl font-bold">
                  {user?.name || "No Name"}
                </h1>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500 text-white">
                  <User className="w-4 h-4 mr-1" />
                  {user?.role === "jobseeker" ? "Job Seeker" : "Recruiter"}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-4 justify-center md:justify-start">
                {user?.profile?.location && (
                  <div className="flex items-center gap-1 text-blue-100">
                    <MapPin className="w-4 h-4" />
                    <span>{user.profile?.location}</span>
                  </div>
                )}
                {user?.email && (
                  <div className="flex items-center gap-1 text-blue-100">
                    <Mail className="w-4 h-4" />
                    <span>{user.email}</span>
                  </div>
                )}
                {user?.profile?.experience && (
                  <div className="flex items-center gap-1 text-blue-100">
                    <Briefcase className="w-4 h-4" />
                    <span>{user.profile.experience} experience</span>
                  </div>
                )}
              </div>

              {user?.profile?.bio && (
                <p className="mt-4 text-blue-100 max-w-2xl">
                  {user.profile.bio}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-medium transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </button>
              {!user.profile?.resume ? (
                 <button onClick={handleDownload} className="flex items-center gap-2 px-6 py-3 border border-blue-300 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors">
                  <Download className="w-4 h-4" />
                  Download Resume
                </button>
              ) : (
                <ResumeUploadExample/>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Profile Performance
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <StatCard
                  icon={Eye}
                  label="Profile Views"
                  value={profileStats.profileViews}
                  color="blue"
                />
                <StatCard
                  icon={Briefcase}
                  label="Applications"
                  value={profileStats.applicationsSent}
                  color="green"
                />
                <StatCard
                  icon={Calendar}
                  label="Interviews"
                  value={profileStats.interviewsScheduled}
                  color="orange"
                />
                <StatCard
                  icon={Award}
                  label="Completion"
                  value={`${profileStats.profileCompletion}%`}
                  color="purple"
                />
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="border-b border-gray-200">
                <nav className="flex gap-8 px-6">
                  {[
                    { id: "overview", label: "Overview", icon: User },
                    {
                      id: "applications",
                      label: "Applications",
                      icon: Briefcase,
                    },
                    { id: "skills", label: "Skills", icon: Award },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 py-4 border-b-2 font-medium transition-colors ${
                        activeTab === tab.id
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === "overview" && <OverviewTab user={user} />}
                {activeTab === "applications" && <ApplicationsTab />}
                {activeTab === "skills" && (
                  <SkillsTab skills={user?.profile?.skills || []} />
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Profile Completion */}
            <ProfileCompletionCard
              completion={profileStats.profileCompletion}
            />

            {/* Contact Information */}
            <ContactInfoCard user={user} />

            {/* Quick Actions */}
            <QuickActionsCard />
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showModal && <ProfileUpdate setShowModal={setShowModal} />}
    </div>
  );
};

const calculateProfileCompletion= (user)=>{
const fields=[
  user.name,user.profile.resume,user.email,user.profile.profileImg,user.profile.website,user.profile.location,user.profile.phone
]
 const filledFields = fields.filter(Boolean).length;
   const totalFields = fields.length;

  return Math.round((filledFields / totalFields) * 100);

}
