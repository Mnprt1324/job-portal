import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch } from "react-redux";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  BriefcaseBusiness,
  Users,
  Building2,
  AlertCircle,
} from "lucide-react";
import PropTypes from "prop-types";
import { loginUserApiCall, registerUserApiCall } from "../../API/api";
import { loginSchema, registerSchema } from "../../validation/userValidation";
import { setUser } from "../../redux/authSlice";
import { toast } from "react-toastify";

const roles = [
  ["jobseeker", "Jobseeker", BriefcaseBusiness],
  ["recruiter", "Recruiter", Users],
  ["company", "Company", Building2],
];

export const AuthForm = ({ signup = false }) => {
  const [visible, setVisible] = useState({});
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signup ? registerSchema : loginSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      ...(signup ? { role: "jobseeker" } : {}),
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const selectedRole = watch("role");
  const onSubmit = async (data) => {
    setServerError("");
    try {
      const response = await (signup
        ? registerUserApiCall(data)
        : loginUserApiCall(data));
      if (!response.data?.success) {
        setServerError(
          response.data?.message ||
            "We could not complete your request. Please try again.",
        );
        return;
      }
      if (signup) {
        toast.success("Account created. Sign in to get started.");
        navigate("/login");
      } else {
        localStorage.setItem("token", `Bearer ${response.data.token}`);
        dispatch(setUser(response.data.user));
        const role = response.data.user.role;
        navigate(
          role === "recruiter"
            ? "/dashboard"
            : role === "company"
              ? "/company/dashboard"
              : "/jobseeker/dashboard",
          { replace: true },
        );
      }
    } catch (error) {
      setServerError(
        error.response?.data?.message ||
          (signup
            ? "We could not create your account. Please try again."
            : "We could not sign you in. Check your details and try again."),
      );
    }
  };
  const field = (name, label, options = {}) => {
    const { password = false, autoComplete, placeholder } = options;
    return (
      <div className="auth-field" key={name}>
        <div className="auth-field-label">
          <label htmlFor={`auth-${name}`}>{label}</label>
          {name === "password" && !signup && (
            <Link to="/forget">Forgot password?</Link>
          )}
        </div>
        <div className="auth-input-wrap">
          <input
            id={`auth-${name}`}
            {...register(name)}
            type={
              password
                ? visible[name]
                  ? "text"
                  : "password"
                : name === "email"
                  ? "email"
                  : "text"
            }
            autoComplete={autoComplete}
            placeholder={placeholder}
            required
            aria-invalid={!!errors[name]}
            aria-describedby={
              [
                signup && name === "password" ? "auth-password-hint" : "",
                errors[name] ? `auth-${name}-error` : "",
              ]
                .filter(Boolean)
                .join(" ") || undefined
            }
          />
          {password && (
            <button
              type="button"
              className="auth-reveal"
              aria-label={`${visible[name] ? "Hide" : "Show"} ${name === "confirmPassword" ? "confirm password" : "password"}`}
              aria-pressed={!!visible[name]}
              onClick={() =>
                setVisible((previous) => ({
                  ...previous,
                  [name]: !previous[name],
                }))
              }
            >
              {visible[name] ? (
                <EyeOff size={18} aria-hidden="true" />
              ) : (
                <Eye size={18} aria-hidden="true" />
              )}
            </button>
          )}
        </div>
        {signup && name === "password" && (
          <p className="auth-field-hint" id="auth-password-hint">
            8+ characters, uppercase, lowercase, a number, and a symbol.
          </p>
        )}
        {errors[name] && (
          <p className="auth-field-error" id={`auth-${name}-error`}>
            {errors[name].message}
          </p>
        )}
      </div>
    );
  };
  return (
    <section
      className={`auth-form-content ${signup ? "auth-signup" : "auth-login"}`}
    >
      <div className="auth-form-heading">
        <p className="eyebrow">
          {signup ? "Start your next chapter" : "Your next move is waiting"}
        </p>
        <h1>{signup ? "Create your account." : "Welcome back."}</h1>
        <p>
          {signup
            ? "A few details, and you are ready to get started."
            : "Sign in to continue your journey with ZipJob."}
        </p>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        aria-busy={isSubmitting}
      >
        <fieldset className="auth-controls" disabled={isSubmitting}>
          {signup && <fieldset className="auth-roles">
            <legend>
              I am joining as a
            </legend>
            <div>
              {roles.map(([value, label, Icon]) => (
                <label
                  key={value}
                  className={selectedRole === value ? "is-selected" : ""}
                >
                  <input type="radio" value={value} {...register("role")} />
                  <Icon size={18} aria-hidden="true" />
                  <span>{label}</span>
                </label>
              ))}
            </div>
            {errors.role && (
              <p className="auth-field-error">{errors.role.message}</p>
            )}
          </fieldset>}
          {signup &&
            field("name", "Full name", {
              autoComplete: "name",
              placeholder: "Your full name",
            })}
          {field("email", "Email address", {
            autoComplete: "email",
            placeholder: "you@example.com",
          })}
          {field("password", "Password", {
            password: true,
            autoComplete: signup ? "new-password" : "current-password",
            placeholder: signup ? "Create a password" : "Enter your password",
          })}
          {signup &&
            field("confirmPassword", "Confirm password", {
              password: true,
              autoComplete: "new-password",
              placeholder: "Enter your password again",
            })}
        </fieldset>
        {serverError && (
          <div className="auth-server-error" role="alert">
            <AlertCircle size={18} aria-hidden="true" />
            <p>{serverError}</p>
          </div>
        )}
        <button
          className="btn-primary auth-submit"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <LoaderCircle
                size={18}
                className="animate-spin"
                aria-hidden="true"
              />
              {signup ? "Creating account..." : "Signing in..."}
            </>
          ) : (
            <>
              {signup ? "Create account" : "Sign in"}
              <ArrowRight size={18} aria-hidden="true" />
            </>
          )}
        </button>
        <p className="auth-switch">
          {signup ? "Already have an account?" : "Do not have an account?"}{" "}
          <Link to={signup ? "/login" : "/register"}>
            {signup ? "Sign in" : "Create an account"}
          </Link>
        </p>
      </form>
    </section>
  );
};
AuthForm.propTypes = { signup: PropTypes.bool };
