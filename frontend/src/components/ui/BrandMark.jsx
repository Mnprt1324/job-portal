export const BrandMark = ({ size = 40, className = "", title = "" }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    role={title ? "img" : undefined}
    aria-hidden={title ? undefined : "true"}
    xmlns="http://www.w3.org/2000/svg"
  >
    {title ? <title>{title}</title> : null}
    <rect width="48" height="48" rx="14" fill="#1F5BD8" />
    <circle cx="24" cy="24" r="14" fill="#2C6CE8" />
    <ellipse cx="24" cy="24" rx="16" ry="7.75" stroke="white" strokeWidth="2.3" />
    <circle cx="35.5" cy="19" r="3.1" fill="#BFE1FF" stroke="white" strokeWidth="1.5" />
    <circle cx="13.25" cy="29.5" r="2.1" fill="white" />
  </svg>
);

