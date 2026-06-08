import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Camera,
  CheckCircle2,
  Edit3,
  Globe,
  Loader2,
  Mail,
  MapPin,
  Save,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  createCompanyApiCall,
  getAllRecurCompanied,
  updateCompanyProfileApi,
} from "../../API/api";

const emptyProfile = {
  companyName: "",
  description: "",
  website: "",
  location: "",
  logo: null,
};

const makeFormData = (profile) => {
  const formData = new FormData();
  formData.append("companyName", profile.companyName);
  formData.append("description", profile.description);
  formData.append("website", profile.website);
  formData.append("location", profile.location);

  if (profile.logo instanceof File) {
    formData.append("logo", profile.logo);
  }

  return formData;
};

export const CompanyProfile = () => {
  const [company, setCompany] = useState(null);
  const [formData, setFormData] = useState(emptyProfile);
  const [preview, setPreview] = useState("");
  const [mode, setMode] = useState("view");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const completion = useMemo(() => {
    const fields = [
      company?.companyName,
      company?.description,
      company?.website,
      company?.location,
      company?.logo,
    ];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  }, [company]);

  const hydrateForm = (nextCompany) => {
    setFormData({
      companyName: nextCompany?.companyName || "",
      description: nextCompany?.description || "",
      website: nextCompany?.website || "",
      location: nextCompany?.location || "",
      logo: null,
    });
    setPreview(nextCompany?.logo || "");
  };

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await getAllRecurCompanied();
        const companies = Array.isArray(response.data.companies)
          ? response.data.companies
          : [];
        const firstCompany = companies[0] || null;

        setCompany(firstCompany);
        hydrateForm(firstCompany);
        setMode(firstCompany ? "view" : "edit");
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Unable to load company profile."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFormData((prev) => ({ ...prev, logo: file }));
    setPreview(URL.createObjectURL(file));
  };

  const handleCancel = () => {
    hydrateForm(company);
    setMode(company ? "view" : "edit");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.companyName.trim()) {
      toast.error("Company name is required.");
      return;
    }

    setSaving(true);
    try {
      let activeCompany = company;

      if (!activeCompany) {
        const createResponse = await createCompanyApiCall({
          companyName: formData.companyName.trim(),
        });
        activeCompany = createResponse.data.company;
      }

      const updateResponse = await updateCompanyProfileApi(
        makeFormData(formData),
        activeCompany._id
      );

      const updatedCompany = updateResponse.data.company;
      setCompany(updatedCompany);
      hydrateForm(updatedCompany);
      setMode("view");
      toast.success("Company profile saved successfully.");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to save company profile."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="flex min-h-screen items-center justify-center rounded-2xl bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              Company Profile
            </p>
            <h1 className="mt-1 text-3xl font-bold text-gray-950">
              {company?.companyName || "Create your company profile"}
            </h1>
            <p className="mt-2 text-gray-600">
              View and update the details candidates will see about your company.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
              {completion}% complete
            </div>
            {mode === "view" && (
              <button
                onClick={() => setMode("edit")}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
              >
                <Edit3 className="h-5 w-5" />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {mode === "view" ? (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm xl:col-span-2">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                {company?.logo ? (
                  <img
                    src={company.logo}
                    alt={`${company.companyName} logo`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Building2 className="h-10 w-10 text-gray-400" />
                )}
              </div>
              <div className="min-w-0">
                <h2 className="text-2xl font-bold text-gray-950">
                  {company?.companyName}
                </h2>
                <p className="mt-2 text-gray-600">
                  {company?.description || "No company description added yet."}
                </p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
              <InfoItem icon={MapPin} label="Location" value={company?.location} />
              <InfoItem icon={Globe} label="Website" value={company?.website} />
              <InfoItem icon={Mail} label="Contact Email" value="Use account email" />
              <InfoItem
                icon={CheckCircle2}
                label="Profile Status"
                value={completion === 100 ? "Complete" : "Needs updates"}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-950">Profile Strength</h3>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-blue-600 transition-all"
                style={{ width: `${completion}%` }}
              />
            </div>
            <p className="mt-4 text-sm text-gray-600">
              Add a logo, website, location, and description so candidates can
              understand your company before applying.
            </p>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[180px_1fr]">
            <div>
              <label className="group flex h-36 w-36 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500 transition hover:border-blue-400 hover:bg-blue-50">
                {preview ? (
                  <img
                    src={preview}
                    alt="Company logo preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <>
                    <Camera className="h-8 w-8" />
                    <span className="mt-2 text-sm font-semibold">Logo</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="sr-only"
                />
              </label>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field
                  label="Company Name"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Enter company name"
                  required
                />
                <Field
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="City, State or Remote"
                />
              </div>

              <Field
                label="Website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://company.com"
              />

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Write a short company description"
                  className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                {company && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    <X className="h-5 w-5" />
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Save className="h-5 w-5" />
                  )}
                  Save Profile
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </section>
  );
};

const Field = ({ label, ...props }) => (
  <div>
    <label className="mb-2 block text-sm font-semibold text-gray-700">
      {label}
    </label>
    <input
      {...props}
      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
    />
  </div>
);

const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          {label}
        </p>
        <p className="truncate text-sm font-semibold text-gray-950">
          {value || "Not added"}
        </p>
      </div>
    </div>
  </div>
);

export default CompanyProfile;
