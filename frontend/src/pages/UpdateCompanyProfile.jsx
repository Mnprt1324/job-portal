import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { updateCompanyProfileApi } from "../API/api";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import useGetCompanyById from "../hooks/useGetCompanyById";
import Spinner from "../components/ui/Spinner";

export const UpdateCompanyProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  useGetCompanyById(id);
  const { singleCompany } = useSelector((store) => store.company);

  const [formData, setFormData] = useState({
    companyName: "",
    description: "",
    location: "",
    website: "",
    logo: null,
  });

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (singleCompany) {
      setFormData({
        companyName: singleCompany.companyName || "",
        description: singleCompany.description || "",
        location: singleCompany.location || "",
        website: singleCompany.website || "",
        logo: null,
      });
      setPreview(singleCompany.logo || null);
    }
  }, [singleCompany]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, logo: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await updateCompanyProfileApi(formData, id);
      if (response.data.success) {
        toast.success(response.data.message);
        navigate("/companies");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Something went wrong. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl rounded-xl bg-white p-8 shadow-lg">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-sm text-blue-600 hover:underline"
        >
          ← Back
        </button>

        <h1 className="mb-6 text-center text-2xl font-semibold">
          Update Company Profile
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Company Name & Location */}
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Company Name"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Enter company name"
            />
            <Input
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter location"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Company description"
              className="w-full rounded-md bg-gray-100 px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          {/* Website & Logo */}
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://company.com"
            />

            <div>
              <label className="mb-1 block text-sm font-medium">
                Company Logo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full rounded-md bg-gray-100 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Logo Preview */}
          {preview && (
            <div className="flex justify-center">
              <img
                src={preview}
                alt="Company Logo Preview"
                className="h-20 w-20 rounded-full object-cover border"
              />
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 py-2.5 text-white font-medium
                       hover:bg-blue-500 transition disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? <Spinner /> : "Update Company"}
          </button>
        </form>
      </div>
    </section>
  );
};

/* ---------- Reusable Input ---------- */
const Input = ({ label, ...props }) => (
  <div>
    <label className="mb-1 block text-sm font-medium">{label}</label>
    <input
      {...props}
      className="w-full rounded-md bg-gray-100 px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
      required
    />
  </div>
);
