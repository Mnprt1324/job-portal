import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod/v3";
import PropTypes from "prop-types";
import {
  Mail,
  KeyRound,
  LockKeyhole,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";
import {
  forgetPasswordApiCall,
  verifyOtpApiCall,
  updatePassApiCall,
} from "../../API/api";
import { setForgetAuth, setResetFlowStep } from "../../redux/authSlice";
import { registerSchema } from "../../validation/userValidation";
import { toast } from "react-toastify";
import "./RecoveryForm.css";

const schemas = {
  email: z.object({
    email: z
      .string()
      .trim()
      .min(1, "Enter your email address.")
      .email("Enter a valid email address.")
      .toLowerCase(),
  }),
  verify: z.object({
    otp: z
      .string()
      .trim()
      .regex(/^\d{6}$/, "Enter the six-digit code from your email."),
  }),
  update: registerSchema
    .innerType()
    .pick({ password: true, confirmPassword: true })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match.",
      path: ["confirmPassword"],
    }),
};
const copy = {
  email: {
    Icon: Mail,
    title: "Forgot your password?",
    description:
      "It happens. Enter the email address on your account and we will send you a six-digit reset code.",
    button: "Send reset code",
    pending: "Sending code...",
    step: 1,
  },
  verify: {
    Icon: KeyRound,
    title: "Check your inbox.",
    description:
      "Enter the six-digit code we sent to your email address to continue.",
    button: "Verify code",
    pending: "Verifying code...",
    step: 2,
  },
  update: {
    Icon: LockKeyhole,
    title: "A fresh start.",
    description:
      "Create a new password for your ZipJob account. Choose one you have not used before.",
    button: "Save new password",
    pending: "Saving password...",
    step: 3,
  },
};

export const RecoveryForm = ({ stage = "email" }) => {
  const [serverError, setServerError] = useState("");
  const [visible, setVisible] = useState({});
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schemas[stage]),
    defaultValues: { email: "", otp: "", password: "", confirmPassword: "" },
  });
  const content = copy[stage];
  const Icon = content.Icon;
  const email = localStorage.getItem("email");
  const submit = async (data) => {
    setServerError("");
    try {
      const response = await (stage === "email"
        ? forgetPasswordApiCall(data)
        : stage === "verify"
          ? verifyOtpApiCall({ email, otp: data.otp })
          : updatePassApiCall({ email, password: data.password }));
      if (!response.data?.success) {
        setServerError(
          response.data?.message ||
            "We could not complete this step. Please try again.",
        );
        return;
      }
      if (stage === "email") {
        localStorage.setItem("email", data.email);
        dispatch(setResetFlowStep("verify"));
        dispatch(setForgetAuth(true));
        navigate("/verify/password");
      } else if (stage === "verify") {
        dispatch(setResetFlowStep("update"));
        navigate("/update/password");
      } else {
        localStorage.removeItem("email");
        dispatch(setForgetAuth(false));
        dispatch(setResetFlowStep("verify"));
        toast.success("Password updated. Sign in with your new password.");
        navigate("/login", { replace: true });
      }
    } catch (error) {
      setServerError(
        error.response?.data?.message ||
          "We could not complete your request. Please try again.",
      );
    }
  };
  const passwordField = (name, label) => (
    <div className="auth-field">
      <div className="auth-field-label">
        <label htmlFor={`reset-${name}`}>{label}</label>
      </div>
      <div className="auth-input-wrap">
        <input
          id={`reset-${name}`}
          type={visible[name] ? "text" : "password"}
          autoComplete="new-password"
          {...register(name)}
          aria-invalid={!!errors[name]}
          aria-describedby={
            errors[name]
              ? `${name}-error`
              : name === "password"
                ? "reset-password-hint"
                : undefined
          }
        />
        <button
          type="button"
          className="auth-reveal"
          aria-label={`${visible[name] ? "Hide" : "Show"} ${name === "confirmPassword" ? "confirm password" : "password"}`}
          aria-pressed={!!visible[name]}
          onClick={() =>
            setVisible((previous) => ({ ...previous, [name]: !previous[name] }))
          }
        >
          {visible[name] ? (
            <EyeOff size={18} aria-hidden="true" />
          ) : (
            <Eye size={18} aria-hidden="true" />
          )}
        </button>
      </div>
      {name === "password" && (
        <p className="auth-field-hint" id="reset-password-hint">
          8+ characters, uppercase, lowercase, a number, and a symbol.
        </p>
      )}
      {errors[name] && (
        <p className="auth-field-error" id={`${name}-error`}>
          {errors[name].message}
        </p>
      )}
    </div>
  );
  return (
    <section className="auth-form-content recovery-form">
      <div className="recovery-icon">
        <Icon size={25} aria-hidden="true" />
      </div>
      <div className="auth-form-heading">
        <p className="eyebrow">Account recovery / Step {content.step} of 3</p>
        <h1>{content.title}</h1>
        <p>{content.description}</p>
      </div>
      {stage === "verify" && email && (
        <p className="recovery-email">
          Sent to <strong>{email}</strong>
          <Link to="/forget">Use a different email</Link>
        </p>
      )}
      <form onSubmit={handleSubmit(submit)} noValidate aria-busy={isSubmitting}>
        <fieldset className="auth-controls" disabled={isSubmitting}>
          {stage === "email" && (
            <div className="auth-field">
              <div className="auth-field-label">
                <label htmlFor="reset-email">Email address</label>
              </div>
              <div className="auth-input-wrap">
                <input
                  id="reset-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  {...register("email")}
                  aria-invalid={!!errors.email}
                  aria-describedby={
                    errors.email ? "reset-email-error" : "reset-email-hint"
                  }
                />
              </div>
              {errors.email ? (
                <p id="reset-email-error" className="auth-field-error">
                  {errors.email.message}
                </p>
              ) : (
                <p className="auth-field-hint" id="reset-email-hint">
                  Use the email you registered with.
                </p>
              )}
            </div>
          )}
          {stage === "verify" && (
            <div className="auth-field">
              <div className="auth-field-label">
                <label htmlFor="reset-code">Verification code</label>
              </div>
              <div className="auth-input-wrap">
                <input
                  id="reset-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="000000"
                  {...register("otp")}
                  aria-invalid={!!errors.otp}
                  aria-describedby={errors.otp ? "reset-code-error" : undefined}
                />
              </div>
              {errors.otp && (
                <p id="reset-code-error" className="auth-field-error">
                  {errors.otp.message}
                </p>
              )}
            </div>
          )}
          {stage === "update" && (
            <>
              {passwordField("password", "New password")}
              {passwordField("confirmPassword", "Confirm new password")}
            </>
          )}
        </fieldset>
        {serverError && (
          <div className="auth-server-error" role="alert">
            <AlertCircle size={18} aria-hidden="true" />
            <p>{serverError}</p>
          </div>
        )}
        <button
          className="btn-primary auth-submit"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? (
            <>
              <LoaderCircle
                size={18}
                className="animate-spin"
                aria-hidden="true"
              />
              {content.pending}
            </>
          ) : (
            <>
              {content.button}
              <ArrowRight size={18} aria-hidden="true" />
            </>
          )}
        </button>
      </form>
      {stage === "verify" && (
        <p className="recovery-note">
          Code expired or did not arrive?{" "}
          <Link to="/forget">Request a new code</Link>
        </p>
      )}
      <Link className="recovery-back" to="/login">
        <ArrowLeft size={16} aria-hidden="true" />
        Back to sign in
      </Link>
      {stage === "email" && (
        <p className="recovery-note">
          You will enter the code on the next screen. No need to leave this
          window.
        </p>
      )}
    </section>
  );
};
RecoveryForm.propTypes = {
  stage: PropTypes.oneOf(["email", "verify", "update"]),
};
