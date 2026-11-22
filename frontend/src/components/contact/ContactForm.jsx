import { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod/v3";
import {
  ArrowUpRight,
  ArrowRight,
  Send,
  LoaderCircle,
  Check,
  AlertCircle,
  KeyRound,
  BriefcaseBusiness,
  MessageSquare,
} from "lucide-react";
import { contactUsApiCall } from "../../API/api";
import "./ContactForm.css";

const schema = z.object({
  name: z.string().trim().min(1, "Enter your name."),
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address.")
    .email("Enter a valid email address."),
  subject: z.string().trim().min(1, "Add a subject for your message."),
  message: z.string().trim().min(1, "Tell us how we can help."),
});

export const ContactForm = () => {
  const { user } = useSelector((store) => store.auth);
  const [serverError, setServerError] = useState("");
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      subject: "",
      message: "",
    },
  });
  const subject = watch("subject");
  const submit = async (data) => {
    setServerError("");
    try {
      const response = await contactUsApiCall(data);
      if (!response.data?.success) {
        setServerError(
          response.data?.message ||
            "We could not send your message. Please try again.",
        );
        return;
      }
      reset({ name: data.name, email: data.email, subject: "", message: "" });
      setSent(true);
    } catch (error) {
      setServerError(
        error.response?.data?.message ||
          "Your message could not be sent. Your details are still here so you can try again.",
      );
    }
  };
  const input = (name, label, placeholder, type = "text") => (
    <div className="contact-field">
      <label htmlFor={`contact-${name}`}>{label}</label>
      <input
        id={`contact-${name}`}
        type={type}
        placeholder={placeholder}
        autoComplete={
          name === "name" ? "name" : name === "email" ? "email" : "off"
        }
        {...register(name)}
        aria-invalid={!!errors[name]}
        aria-describedby={errors[name] ? `contact-${name}-error` : undefined}
      />
      {errors[name] && (
        <p className="contact-field-error" id={`contact-${name}-error`}>
          {errors[name].message}
        </p>
      )}
    </div>
  );
  return (
    <div className="contact-page page-container">
      <section className="contact-intro">
        <p className="eyebrow">Get in touch</p>
        <h1>
          A question. An idea.
          <br />
          <span>A place to start.</span>
        </h1>
        <p>
          Whether you are looking for work or building a team, tell us what is
          on your mind.
        </p>
      </section>
      <div className="contact-layout">
        <aside
          className="contact-guidance"
          aria-label="Contact and help options"
        >
          <div className="contact-guidance-heading">
            <span className="contact-mail-icon">
              <MessageSquare size={24} aria-hidden="true" />
            </span>
            <h2>We are listening.</h2>
            <p>
              Need help with your account, a job listing, or an application?
              Send a message with a few details so we can understand what you
              need.
            </p>
          </div>
          <div className="contact-help-links">
            <p className="eyebrow">A useful place to look first</p>
            {[
              [
                KeyRound,
                "Trouble signing in?",
                "Reset your password",
                "/forget",
              ],
              [
                BriefcaseBusiness,
                "Looking for your next role?",
                "Explore opportunities",
                "/findJob",
              ],
              [
                MessageSquare,
                "A quick question?",
                "Read common questions",
                "/#questions",
              ],
            ].map(([Icon, title, label, to]) => (
              <Link key={to} to={to}>
                <Icon size={20} aria-hidden="true" />
                <span>
                  <strong>{title}</strong>
                  <span>{label}</span>
                </span>
                <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
            ))}
          </div>
          <p className="contact-privacy-note">
            Please leave out passwords, verification codes, and other sensitive
            account details.
          </p>
        </aside>
        <section
          className="contact-form-panel"
          aria-labelledby="contact-form-title"
        >
          {sent ? (
            <div className="contact-success" role="status">
              <span className="contact-success-icon">
                <Check size={28} aria-hidden="true" />
              </span>
              <p className="eyebrow">Message sent</p>
              <h2 id="contact-form-title">Thanks for reaching out.</h2>
              <p>
                Your message has been sent to the JobOrbit team. You can continue
                exploring while you wait for a reply.
              </p>
              <button
                className="btn-primary"
                type="button"
                onClick={() => setSent(false)}
              >
                Send another message
                <ArrowRight size={18} aria-hidden="true" />
              </button>
              <Link to="/findJob" className="text-link">
                Explore jobs
                <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
            </div>
          ) : (
            <>
              <div className="contact-form-heading">
                <p className="eyebrow">A direct line to JobOrbit</p>
                <h2 id="contact-form-title">Send us a message.</h2>
                <p>All fields are required. We will use your email to reply.</p>
              </div>
              <form
                onSubmit={handleSubmit(submit)}
                noValidate
                aria-busy={isSubmitting}
              >
                <fieldset className="contact-controls" disabled={isSubmitting}>
                  <div className="contact-name-email">
                    {input("name", "Your name", "Your full name")}
                    {input(
                      "email",
                      "Email address",
                      "you@example.com",
                      "email",
                    )}
                  </div>
                  <div className="contact-topics">
                    <span>What is it about?</span>
                    <div>
                      {[
                        "Account access",
                        "Job applications",
                        "Company support",
                      ].map((topic) => (
                        <button
                          key={topic}
                          type="button"
                          aria-pressed={subject === topic}
                          onClick={() =>
                            setValue("subject", topic, {
                              shouldDirty: true,
                              shouldValidate: !!errors.subject,
                            })
                          }
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  </div>
                  {input(
                    "subject",
                    "Subject",
                    "A short summary of your question",
                  )}
                  <div className="contact-field">
                    <label htmlFor="contact-message">Your message</label>
                    <textarea
                      id="contact-message"
                      rows={5}
                      placeholder="Tell us what happened or how we can help..."
                      {...register("message")}
                      aria-invalid={!!errors.message}
                      aria-describedby={
                        errors.message
                          ? "contact-message-error"
                          : "contact-message-hint"
                      }
                    />
                    {errors.message ? (
                      <p
                        id="contact-message-error"
                        className="contact-field-error"
                      >
                        {errors.message.message}
                      </p>
                    ) : (
                      <p
                        id="contact-message-hint"
                        className="contact-field-hint"
                      >
                        For a technical issue, include the page and what you
                        were trying to do.
                      </p>
                    )}
                  </div>
                </fieldset>
                {serverError && (
                  <div className="auth-server-error" role="alert">
                    <AlertCircle size={18} aria-hidden="true" />
                    <p>{serverError}</p>
                  </div>
                )}
                <button
                  type="submit"
                  className="btn-primary contact-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <LoaderCircle
                        size={18}
                        className="animate-spin"
                        aria-hidden="true"
                      />
                      Sending your message...
                    </>
                  ) : (
                    <>
                      Send message
                      <Send size={18} aria-hidden="true" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
};
