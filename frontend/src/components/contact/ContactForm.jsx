import { useState } from "react";
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt } from "react-icons/fa";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { contactUsApiCall } from "../../API/api";
import Spinner from "../ui/Spinner";

export const ContactForm = () => {
  const { user } = useSelector((store) => store.auth);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await contactUsApiCall(formData);
      if (response.data.success) {
        toast.success(response.data.message);
        setFormData({
          name: user?.name || "",
          email: user?.email || "",
          subject: "",
          message: "",
        });
      } else {
        toast.error(response.message || "Failed to send message.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto my-12 flex max-w-6xl flex-col gap-10 px-4 md:flex-row">
      {/* Contact Info */}
      <div className="flex w-full flex-col justify-between rounded-xl border border-blue-500 bg-white p-6 shadow-md md:w-72">
        {[
          {
            icon: <FaMapMarkerAlt />,
            title: "Location",
            text: "329 Queensberry Street, North Melbourne VIC 3051, Australia.",
          },
          {
            icon: <FaPhoneAlt />,
            title: "Phone",
            text: "123-456-7890",
          },
          {
            icon: <FaEnvelope />,
            title: "Email",
            text: "zipJobcustomer1345@gmail.com",
          },
        ].map((item, index) => (
          <div key={index} className="text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              {item.icon}
            </div>
            <h2 className="text-lg font-semibold">{item.title}</h2>
            <p className="mt-2 text-sm text-gray-600">{item.text}</p>
          </div>
        ))}
      </div>

      {/* Contact Form */}
      <form
        onSubmit={handleSubmit}
        className="w-full rounded-xl border border-blue-500 bg-white px-8 py-7 shadow-md md:w-[42rem]"
      >
        <div className="mb-6 flex items-center gap-2">
          <FaEnvelope className="text-xl text-blue-600" />
          <h2 className="text-xl font-bold">Contact Us</h2>
        </div>

        <p className="mb-6 text-sm text-gray-500">
          Fill out the form below and we’ll get back to you soon.
        </p>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Name */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your name"
              className="rounded-md bg-slate-100 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Email */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your email"
              className="rounded-md bg-slate-100 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Subject */}
        <div className="mt-5 flex flex-col">
          <label className="mb-1 text-sm font-medium">
            Subject <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Subject"
            className="rounded-md bg-slate-100 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Message */}
        <div className="mt-5 flex flex-col">
          <label className="mb-1 text-sm font-medium">
            Message <span className="text-red-500">*</span>
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Write your message..."
            rows={4}
            className="rounded-md bg-slate-100 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center rounded-md bg-blue-600 py-2.5 text-white font-medium
                     hover:bg-blue-500 transition disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? <Spinner /> : "Send Message"}
        </button>
      </form>
    </section>
  );
};

