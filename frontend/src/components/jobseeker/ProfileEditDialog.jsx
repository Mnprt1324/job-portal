import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod/v3";
import PropTypes from "prop-types";
import { X, LoaderCircle, ArrowRight, AlertCircle } from "lucide-react";
import { updateUserProfile } from "../../API/api";
import { setUser } from "../../redux/authSlice";

const webAddress = z
  .string()
  .trim()
  .refine((value) => {
    if (!value) return true;
    try {
      return ["http:", "https:"].includes(new URL(value).protocol);
    } catch {
      return false;
    }
  }, "Enter a complete http or https address.");
const schema = z.object({
  name: z.string().trim().min(1, "Enter your full name."),
  email: z.string().trim().email("Enter a valid email address."),
  bio: z.string().trim().max(500, "Keep your introduction to 500 characters."),
  phone: z.string().trim(),
  location: z.string().trim(),
  skills: z.string(),
  website: webAddress,
  github: webAddress,
});

export const ProfileEditDialog = ({ user, onClose, onSaved }) => {
  const ref = useRef(null);
  const dispatch = useDispatch();
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user.name || "",
      email: user.email || "",
      bio: user.profile?.bio || "",
      phone: user.profile?.phone || "",
      location: user.profile?.location || "",
      skills: (user.profile?.skills || []).join(", "),
      website: user.profile?.website || "",
      github: user.profile?.github || "",
    },
  });
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previous;
    };
  }, []);
  const submit = async (data) => {
    setError("");
    try {
      const payload = new FormData();
      Object.entries(data).forEach(([key, value]) =>
        payload.append(
          key,
          key === "skills"
            ? JSON.stringify([
                ...new Set(
                  value
                    .split(",")
                    .map((skill) => skill.trim())
                    .filter(Boolean),
                ),
              ])
            : value,
        ),
      );
      if (image) payload.append("profileImage", image);
      const response = await updateUserProfile(payload);
      if (!response.data?.success || !response.data.user)
        throw new Error(
          response.data?.message || "We could not save your profile.",
        );
      dispatch(setUser(response.data.user));
      onSaved();
      onClose();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "We could not save your profile. Please try again.",
      );
    }
  };
  const input = (name, label, options = {}) => (
    <div className="pp-field">
      <label htmlFor={`profile-edit-${name}`}>{label}</label>
      <input
        id={`profile-edit-${name}`}
        type={name === "email" ? "email" : name === "phone" ? "tel" : "text"}
        autoComplete={options.autoComplete || "off"}
        placeholder={options.placeholder}
        {...register(name)}
        aria-invalid={!!errors[name]}
        aria-describedby={
          errors[name] ? `profile-edit-${name}-error` : undefined
        }
      />
      {errors[name] && (
        <p className="pp-field-error" id={`profile-edit-${name}-error`}>
          {errors[name].message}
        </p>
      )}
    </div>
  );
  return (
    <dialog
      ref={ref}
      className="pp-dialog"
      aria-labelledby="profile-edit-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!isSubmitting) onClose();
      }}
    >
      <div className="pp-dialog-heading">
        <div>
          <p className="eyebrow">Your story, in your words</p>
          <h2 id="profile-edit-title">Edit your profile</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          aria-label="Close profile editor"
        >
          <X size={21} />
        </button>
      </div>
      <form onSubmit={handleSubmit(submit)} noValidate aria-busy={isSubmitting}>
        <fieldset disabled={isSubmitting} className="pp-form-controls">
          <div className="pp-form-grid">
            {input("name", "Full name", { autoComplete: "name" })}
            {input("email", "Email address", { autoComplete: "email" })}
            {input("phone", "Phone number (optional)", { autoComplete: "tel" })}
            {input("location", "Location", {
              autoComplete: "address-level2",
              placeholder: "City or region",
            })}
          </div>
          <div className="pp-field">
            <label htmlFor="profile-edit-bio">Professional introduction</label>
            <textarea
              id="profile-edit-bio"
              rows={4}
              placeholder="A little about your experience and the work you want to do."
              {...register("bio")}
              aria-invalid={!!errors.bio}
              aria-describedby={
                errors.bio ? "profile-edit-bio-error" : "profile-edit-bio-hint"
              }
            />
            {errors.bio ? (
              <p id="profile-edit-bio-error" className="pp-field-error">
                {errors.bio.message}
              </p>
            ) : (
              <p className="pp-field-hint" id="profile-edit-bio-hint">
                Up to 500 characters.
              </p>
            )}
          </div>
          {input("skills", "Skills", {
            placeholder: "React, JavaScript, Product design",
          })}
          <p className="pp-field-hint pp-skills-hint">
            Separate each skill with a comma.
          </p>
          <div className="pp-form-grid">
            {input("website", "Portfolio website (optional)", {
              placeholder: "https://your-portfolio.com",
            })}
            {input("github", "GitHub (optional)", {
              placeholder: "https://github.com/your-name",
            })}
          </div>
          <div className="pp-field">
            <label htmlFor="profile-edit-image">Profile photo (optional)</label>
            <input
              id="profile-edit-image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              aria-describedby="profile-image-hint"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (
                  file &&
                  (!["image/jpeg", "image/png", "image/webp"].includes(
                    file.type,
                  ) ||
                    file.size > 5 * 1024 * 1024)
                ) {
                  setImage(null);
                  event.target.value = "";
                  setError("Choose a JPG, PNG, or WebP image up to 5 MB.");
                  return;
                }
                setError("");
                setImage(file || null);
              }}
            />
            <p id="profile-image-hint" className="pp-field-hint">
              JPG, PNG, or WebP, up to 5 MB. Leave empty to keep your current
              photo.
            </p>
          </div>
        </fieldset>
        {error && (
          <div className="pp-alert pp-alert-error" role="alert">
            <AlertCircle size={18} aria-hidden="true" />
            <p>{error}</p>
          </div>
        )}
        <div className="pp-dialog-actions">
          <button
            type="button"
            className="pp-secondary-button"
            disabled={isSubmitting}
            onClick={onClose}
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <LoaderCircle
                  size={17}
                  className="animate-spin"
                  aria-hidden="true"
                />
                Saving...
              </>
            ) : (
              <>
                Save changes
                <ArrowRight size={17} aria-hidden="true" />
              </>
            )}
          </button>
        </div>
      </form>
    </dialog>
  );
};
ProfileEditDialog.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    profile: PropTypes.shape({
      bio: PropTypes.string,
      phone: PropTypes.string,
      location: PropTypes.string,
      skills: PropTypes.arrayOf(PropTypes.string),
      website: PropTypes.string,
      github: PropTypes.string,
    }),
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onSaved: PropTypes.func.isRequired,
};
