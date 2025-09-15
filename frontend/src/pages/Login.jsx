import { useState } from "react";
import {
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaLock,
  FaBriefcase,
  FaUserTie,
  FaSpinner,
} from "react-icons/fa";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginUserApiCall } from "../API/api";
import { loginSchema } from "../validation/userValidation";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { setAuthenticate, setUser } from "../redux/authSlice";
import { useDispatch } from "react-redux";

// Enhanced Zod Schema with better validation

export const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid, touchedFields },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "jobseeker",
    },
    mode: "onChange",
  });

  // Watch form values for dynamic styling
  const watchedValues = watch();

  // Form submit handler
  const onSubmit = async (data) => {
    try {
      const response = await loginUserApiCall(data);
      if (response.data?.success) {
         const token=`Bearer ${response.data.token}`;
         localStorage.setItem("token",token)
        const role = response.data.user.role;
        toast.success(response.data.message);
        role === "recruiter" ? navigate("/companies") : navigate("/");
        dispatch(setAuthenticate());
        dispatch(setUser(response.data.user));

        reset();
      }
    } catch (error) {
      console.log(error)
      toast.error(
        error.response?.data?.message || "Login failed. Please try again."
      );
    }
  };

  const getFieldStatus = (fieldName) => {
    if (errors[fieldName]) return "error";
    if (
      touchedFields[fieldName] &&
      watchedValues[fieldName] &&
      !errors[fieldName]
    )
      return "success";
    return "default";
  };

  const getFieldClasses = (fieldName) => {
    const status = getFieldStatus(fieldName);
    const baseClasses =
      "w-full h-12 px-4 pr-12 bg-gray-50 border-2 rounded-lg transition-all duration-200 focus:outline-none focus:bg-white";

    switch (status) {
      case "error":
        return `${baseClasses} border-red-500 focus:border-red-500`;
      case "success":
        return `${baseClasses} border-green-500 focus:border-green-500`;
      default:
        return `${baseClasses} border-gray-200 focus:border-blue-500`;
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Main Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 relative overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-100 rounded-full translate-y-12 -translate-x-12 opacity-50"></div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600 text-sm">
              Please sign in to your account to continue
            </p>
          </div>

          {/* Login Form */}
          <div className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Email Field */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaEnvelope className="inline mr-2 text-blue-600" />
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  {...register("email")}
                  placeholder="Enter your email address"
                  className={getFieldClasses("email")}
                  autoComplete="email"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {getFieldStatus("email") === "success" && (
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                  {getFieldStatus("email") === "error" && (
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaLock className="inline mr-2 text-blue-600" />
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="Enter your password"
                  className={getFieldClasses("password")}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <FaEyeSlash size={18} />
                  ) : (
                    <FaEye size={18} />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <button
                type="button"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline transition-colors"
                onClick={() => navigate("/forget")}
              >
                Forgot your password?
              </button>
            </div>

            {/* Role Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                I am signing in as <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`cursor-pointer p-4 border-2 rounded-lg transition-all duration-200 hover:shadow-md ${
                    watchedValues.role === "jobseeker"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    value="jobseeker"
                    {...register("role")}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <FaBriefcase
                      className={`mx-auto mb-2 text-xl ${
                        watchedValues.role === "jobseeker"
                          ? "text-blue-600"
                          : "text-gray-400"
                      }`}
                    />
                    <span className="font-medium text-sm">Job Seeker</span>
                  </div>
                </label>

                <label
                  className={`cursor-pointer p-4 border-2 rounded-lg transition-all duration-200 hover:shadow-md ${
                    watchedValues.role === "recruiter"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    value="recruiter"
                    {...register("role")}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <FaUserTie
                      className={`mx-auto mb-2 text-xl ${
                        watchedValues.role === "recruiter"
                          ? "text-blue-600"
                          : "text-gray-400"
                      }`}
                    />
                    <span className="font-medium text-sm">Recruiter</span>
                  </div>
                </label>
              </div>
              {errors.role && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.role.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting || !isValid}
              className={`w-full h-12 rounded-lg font-medium text-white transition-all duration-200 flex items-center justify-center ${
                isSubmitting || !isValid
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
              }`}
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>

            {/* Sign Up Link */}
            <div className="text-center pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
                  onClick={() => navigate("/register")}
                >
                  Create one here
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
