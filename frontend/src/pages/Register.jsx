import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FaInfinity, FaEye, FaEyeSlash, FaTimes, FaUser, FaEnvelope, FaLock, FaBriefcase, FaUserTie, FaBuilding } from "react-icons/fa";
import { registerUserApiCall } from "../API/api";
import { toast } from "react-toastify";
import { registerSchema } from "../validation/userValidation";
import { useNavigate } from "react-router-dom";

// ✅ Zod schema for validation


export const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate=useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "jobseeker",
    },
  });

  const passwordValue = watch("password");

  // ✅ Password strength logic
  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      score: [minLength, hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length,
    };
  };

  const passwordStrength = validatePassword(passwordValue || "");

  const getPasswordStrengthColor = () => {
    if (passwordStrength.score <= 2) return "bg-red-500";
    if (passwordStrength.score <= 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength.score <= 2) return "Weak";
    if (passwordStrength.score <= 3) return "Fair";
    if (passwordStrength.score <= 4) return "Good";
    return "Strong";
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await registerUserApiCall(data);
      if (response.data.success) {
        toast.success("Registration successful! Please login.")
        navigate("/login")
        reset();
      }
    } catch (error) {
      toast.error("Registration failed. Please try again.")
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex justify-center items-center py-12 px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg">
        {/* Logo Section */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <FaInfinity className="text-blue-600 text-3xl mr-2" />
            <h1 className="font-bold text-2xl text-gray-800">ZipJob</h1>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Create Account</h2>
          <p className="text-gray-600 text-sm">
            Join thousands of professionals finding their dream jobs
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Full Name */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaUser className="inline mr-2" />
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("name")}
              placeholder="Enter your full name"
              className={`w-full h-12 px-4 pr-10 bg-gray-50 border-2 rounded-lg focus:outline-none ${
                errors.name ? "border-red-500" : "border-gray-200 focus:border-blue-500"
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1 flex items-center">
                <FaTimes className="mr-1" /> {errors.name.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaEnvelope className="inline mr-2" />
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              {...register("email")}
              placeholder="Enter your email"
              className={`w-full h-12 px-4 pr-10 bg-gray-50 border-2 rounded-lg focus:outline-none ${
                errors.email ? "border-red-500" : "border-gray-200 focus:border-blue-500"
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1 flex items-center">
                <FaTimes className="mr-1" /> {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaLock className="inline mr-2" />
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="Create a strong password"
                className={`w-full h-12 px-4 pr-12 bg-gray-50 border-2 rounded-lg focus:outline-none ${
                  errors.password ? "border-red-500" : "border-gray-200 focus:border-blue-500"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600"
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {passwordValue && (
              <div className="mt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-600">Password Strength:</span>
                  <span
                    className={`text-xs font-medium ${
                      passwordStrength.score <= 2
                        ? "text-red-500"
                        : passwordStrength.score <= 3
                        ? "text-yellow-500"
                        : "text-green-500"
                    }`}
                  >
                    {getPasswordStrengthText()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getPasswordStrengthColor()}`}
                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaLock className="inline mr-2" />
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword")}
                placeholder="Confirm your password"
                className={`w-full h-12 px-4 pr-12 bg-gray-50 border-2 rounded-lg focus:outline-none ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-200 focus:border-blue-500"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600"
              >
                {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1 flex items-center">
                <FaTimes className="mr-1" /> {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              I am a <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label
                className={`cursor-pointer p-4 border-2 rounded-lg ${
                  watch("role") === "jobseeker"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white"
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
                    className={`mx-auto mb-2 text-2xl ${
                      watch("role") === "jobseeker" ? "text-blue-600" : "text-gray-400"
                    }`}
                  />
                  <span className="font-medium">Job Seeker</span>
                </div>
              </label>

              <label
                className={`cursor-pointer p-4 border-2 rounded-lg ${
                  watch("role") === "recruiter"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white"
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
                    className={`mx-auto mb-2 text-2xl ${
                      watch("role") === "recruiter" ? "text-blue-600" : "text-gray-400"
                    }`}
                  />
                  <span className="font-medium">Recruiter</span>
                </div>
              </label>

              <label
                className={`cursor-pointer p-4 border-2 rounded-lg ${
                  watch("role") === "company"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white"
                }`}
              >
                <input
                  type="radio"
                  value="company"
                  {...register("role")}
                  className="sr-only"
                />
                <div className="text-center">
                  <FaBuilding
                    className={`mx-auto mb-2 text-2xl ${
                      watch("role") === "company" ? "text-blue-600" : "text-gray-400"
                    }`}
                  />
                  <span className="font-medium">Company</span>
                </div>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full h-12 rounded-lg font-medium text-white ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>

          {/* Login Link */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <a href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                Sign in here
              </a>
            </p>
          </div>
        </form>
      </div>
    </section>
  );
};
