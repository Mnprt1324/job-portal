# ZipJob frontend design and verification

GATE: ERROR (Taste checker timed out; automated consistency, layout, and copy checks did not complete). No gate pass or performance certification is claimed. The skill instructs not to rerun after this error; independent Playwright checks were completed instead. No waivers were added.

## Design direction

Software: a job discovery and application platform for jobseekers and recruiters. Primary action: Search jobs.

Existing ZipJob blue was retained through Taste's brand palette command rather than introducing a different brand. Centered hero and IBM Plex Sans came from the skill's design workflow. The palette uses off-white #f7f8fa, white #ffffff, ink #172331, muted #526173, and blue #1955d1. Blue remains the action, focus, and link color; error and success colors remain semantic. Tailwind blue utilities and legacy violet/purple accents map into this shared palette in src/index.css. Change shared tokens there for future branding work.

Voice: direct, encouraging, practical; no invented audience statistics, employer promises, reviews, or hiring claims.

Page plan: centered search hero and interactive job-search shortcuts; real API-backed jobs; three application steps; dark career statement with the dealt liquid-type moment; accessible FAQs; real footer destinations. The liquid-type source is an unmodified local copy of Taste's module, with cleanup and reduced-motion/touch fallbacks. No shader, scene, stock photograph, invented company logo, or external image is required. Typography uses Google Fonts with a system sans fallback. Sections grow with real application content rather than clipping listings into fixed screen heights.

The earlier modified hero and navigation were incorporated into the redesign. Existing company sidebar, company jobs, job creation, and protected-route work were preserved. Public page colors inherit the new theme; authenticated dashboards have not undergone a complete visual redesign.

## Fixes

- Removed duplicate homepage listing sections and unsupported statistics.
- Search keyword, filter, sorting, and pagination use URL parameters; browser history and direct links stay meaningful.
- Search submits with Enter; terms are encoded with URLSearchParams.
- Filters remain available on mobile and accurately describe their single-keyword API behavior.
- Each listing consumer reads its own fetched jobs, avoiding featured jobs overwriting visible search results.
- Outdated responses are ignored after dependency changes/unmount.
- Separate loading, empty, and failure states; retry makes a fresh request.
- Job cards use real links and visible actions; removed the nonfunctional Apply handler and temporary bookmark toggle.
- Keyboard-operable FAQ buttons announce expanded state and do not truncate answers.
- Visible focus rings, skip link, semantic main landmark, labeled search, and reduced-motion support.
- Mobile navigation closes with Escape and preserves existing account/logout behavior.
- Footer destinations point at actual routes rather than placeholder links.

## Verification

- Production build: passed. Vite retains a bundle size warning (main JavaScript exceeds 500 kB). Route splitting is a follow-up optimization.
- ESLint on changed application components and hooks: passed. This is not a claim that all legacy project lint errors are resolved.
- Home browser matrix: 1440, 1024, 768, 390, and 320 CSS pixels; screenshots saved and visually inspected at desktop and mobile sizes.
- Find jobs, Login, Register, About, and Contact: no horizontal document scrolling at 1440, 390, or 320 pixels. Login's decorative circles extend outside their clipped parent without causing document overflow.
- Menu open/close and Escape, FAQ expansion/collapse, Enter search, location filtering, sort order, clear filter: passed.
- Reduced-motion emulation: hero animation is none. First keyboard focus: Skip to content.
- Browser-only fixtures: job cards, pagination, page reset on filter changes, empty state, clear search, and unauthenticated role link redirect to Login: passed.
- Intercepted failed request followed by successful retry: passed; retry sent a new request and displayed the empty state correctly.

The running local jobs endpoint returns HTTP 500. Successful listing and pagination states were therefore verified using explicitly isolated Playwright network fixtures. Those fixtures are not shipped as app data. Real sign-in, application submission, uploads, recruiter CRUD, and database-backed end-to-end behavior remain unverified.

No assumed prices, reviews, customer counts, domain, contacts, client asset slots, stock photographs, or new brand name were introduced. Canonical/share URLs still require the production domain; no fabricated URL was added. There are no copy-lint results to report because the Taste run did not complete.

Screenshots and reproducible Playwright CLI snippets: ../output/playwright/.

## Authentication layout update

Login and registration now sit under AuthLayout outside AppLayout. They have no public navbar/footer. Desktop uses a dark brand/steps panel and a compact form; mobile uses a single form column with a home link. Both use the shared global colors and spacing. Recovery routes retain their existing layout.

AuthForm shares the role picker, properly associated labels, inline schema errors, password reveal controls, submit states, and API error handling. Login is now a real form, so Enter submits correctly. Submit remains available to surface validation; only pending requests disable controls. Failed requests retain entered values. Registration password guidance matches the existing schema. Login stores auth state before navigating to the existing role destination.

Playwright checked both routes at 1440, 1024, 768, 390, and 320 pixels: no horizontal scrolling and no public header/footer. Required-field errors, reveal controls, roles, Enter submit, failed-login feedback, retained email, password mismatch, mocked registration redirect, and returning to the public homepage passed. API responses were intercepted for these form checks; no real account was created. Screenshots: output/playwright/auth-login-1440.png, auth-login-390.png, auth-register-1440.png, and auth-register-390.png. Targeted ESLint and the production build pass. The existing bundle-size warning remains.

## About page and footer update

Replaced the About page's disconnected gallery, long card of generic text, unverified user counts, and unsupported AI-feature claims with an editorial introduction, product purpose, interactive jobseeker/recruiter workflows, and three concrete product principles. The page uses shared global tokens and live text; it does not depend on external photographs. The old gallery was not displaying images in browser verification, and no stock image is presented as ZipJob's team.

The shared public footer now has a dark ink ground, a clear job-discovery action, three navigable link groups, a large typographic closing, and a back-to-top link. Login and registration remain footer-free.

Targeted ESLint and production build pass. Playwright verified loaded styles, no horizontal scrolling at 1440, 1024, 768, 390, and 320 pixels, both audience perspectives and pressed states, the remote-jobs query link, FAQ deep linking, back-to-top behavior, and authentication layout separation. The dev server briefly cached an empty stylesheet after a file write; it was restarted and the complete checks were rerun successfully. Screenshots: output/playwright/about-redesign-1440.png and about-redesign-390.png. No new backend dependencies or API changes were required.

## Password recovery redesign

Forgot password, code verification, and new password routes now use AuthLayout without public navigation or footer. Added a compact recovery form, recovery-specific sidebar steps, inline validation and server errors, pending states, paste/autofill-friendly six-digit code entry, masked passwords with reveal controls, a return to sign-in link, and accurate code-based recovery copy. Removed dispatches during render and sensitive password/code console logging from the old UI. Fixed invalid recovery redirects, set recovery state only after a successful request, and clear recovery state when complete. These frontend route checks do not replace backend authorization.

Targeted ESLint and production build pass. Playwright checked 1440, 768, 390, and 320 pixels without horizontal overflow or public shell. The mocked three-step flow passed required/invalid email, normalization, retained values on failure, code validation, paste/Enter submission, password masking/mismatch, login redirect, cleanup, and direct-route guard checks. No real emails were sent or account passwords changed. Screenshots: output/playwright/forgot-password-1440.png and forgot-password-390.png.

## Contact page redesign

Replaced the old contact boxes with an editorial introduction, a compact form, useful account/job/FAQ links, and a short privacy reminder. Removed the placeholder address and phone details. Uses shared brand tokens, preserves logged-in name/email prefill, provides topic shortcuts without restricting the subject, labels every field, and shows inline schema errors. Failed submissions retain all entered content; success is rendered only after an API success response, with a send-another-message action. Corrected the frontend endpoint from /contactUs//sendandsave to /contactUs/sendandsave.

Targeted ESLint and production build pass. Playwright checked 1440, 1024, 768, 390, and 320 pixels with no horizontal overflow, required/invalid-email validation, topic selection, preserved message on API error, success/reset, and the recovery help link. Responses were mocked: no real contact messages or emails were sent, and backend delivery has not been verified. Screenshots: output/playwright/contact-redesign-1440.png and contact-redesign-390.png.

## Jobseeker workspace

Jobseekers now land at /jobseeker/dashboard after login. A signed-in jobseeker opening / is redirected to the same dashboard; visitors retain the public homepage. Recruiters and company users retain their existing login destinations. Public navigation exposes a Dashboard link to jobseekers. /jobseeker is canonicalized to /jobseeker/dashboard.

The separate workspace has no public navbar/footer. It includes a persistent desktop sidebar, accessible mobile drawer, welcome panel, application totals by actual status, recent applications, latest public jobs, profile completeness (name/email, bio, location, skills, resume), resume/profile links, and skill-based search shortcuts. /jobseeker/applications provides status filtering and role/company search via URL parameters. Job details, profile management, and job search link to the existing pages. The profile resume button condition was corrected so users with no resume can reach the existing upload control; no profile-page redesign or upload rewrite was done.

Applications are fetched through the existing authenticated API. The dashboard uses component-local response data, ignores obsolete responses, exposes error/retry states, and displays unavailable counts as a dash rather than a misleading zero. No invented growth, interview statistics, saved-job counts, messages, or AI recommendations are shown. The latest-jobs panel uses the existing public jobs endpoint. Logout uses the real logout API and removes local authentication only after success.

Verification: production build and targeted ESLint pass. Existing Vite bundle-size warning remains. Isolated Playwright fixtures verified jobseeker login/root redirects, role-specific access, correct application counts and profile score, populated/empty/error/retry states, application status/search/clear, mobile drawer and Escape, sign-out, and unauthenticated protection. No React page errors or horizontal overflow at 1440, 1024, 768, 390, and 320 pixels. Separate fixtures verified recruiter/company destinations and the visitor homepage. No real accounts were modified and no fake records were inserted. Fixture screenshots: output/playwright/jobseeker-dashboard-1440.png and jobseeker-dashboard-390.png. The application code reads live API responses; fixture values exist only in the browser verification scripts.

## Profile, job search, and job details inside the jobseeker workspace

Added /jobseeker/profile, /jobseeker/jobs, and /jobseeker/jobs/:id under the protected JobseekerLayout. Sidebar, welcome actions, application links, skill links, profile actions, and job cards now use workspace destinations. The breadcrumb and sidebar active states follow the current workspace page. Jobseekers opening legacy /profile, /findJob, or /job/apply/:id links are redirected before the public layout renders; query strings and hashes are preserved. Visitor and other-role routes retain their existing layout.

Reused the existing profile and job detail components with scoped workspace sizing. Fixed small-screen profile navigation/text overflow. Profile completion now uses the same checklist as the dashboard, and hard-coded view/interview/application numbers were replaced by actual workspace application status totals. Job detail fetching now follows id changes, clears stale data, ignores obsolete responses, and provides error/retry UI. A successful application disables repeat submission and refreshes workspace application data.

Playwright verified all three pages at 1440, 390, and 320 pixels, no public navbar/footer, no horizontal overflow, legacy redirects with query parameters, canonical job-card links, changing job IDs, a mocked application and badge refresh, and failed job loading with retry. No React page errors. API responses were isolated browser fixtures; no real application was submitted. Targeted checks and build passed. Screenshots: output/playwright/workspace-profile-1440.png, workspace-jobs-1440.png, and workspace-job-detail-1440.png (390px variants also available).

## Job-detail visual redesign

Rebuilt job details to match the workspace's neutral cards, blue accent, type scale, borders, spacing, and responsive behavior. The page now has a company/role header, readable role description and requirements, optional real company description/site, and a compact overview/application rail. On mobile, the application panel is placed before longer role text. Removed emoji metadata, neon badges, repeated role fields, and arbitrary dollar/year salary assumptions. Company display reads companyName; the backend detail query now populates the company's display fields.

Job details use the workspace's shared application response, avoiding duplicate application fetches. Non-workspace consumers can use the same hook with an enabled flag. Application status checks, pending submission, inline failure, retry, success/already-applied, and a link to My applications are explicit. Success refreshes shared dashboard data. No new platform capabilities or artificial job facts were introduced.

Targeted ESLint, frontend build, and backend controller syntax check pass. Playwright checked 1440, 1024, 768, 390, and 320 pixels without overflow or React page errors, company display, salary without invented currency, failure/retry, successful application state, no-repeat action, persisted applied state, applications navigation, and job/status retries. Application requests were intercepted; no real applications were sent. Screenshots: output/playwright/job-detail-redesign-1440.png and job-detail-redesign-390.png. Backend company population was syntax-checked; browser data checks used fixtures.

## Profile visual and interaction redesign

Replaced the gradient profile banner, oversized performance tiles, placeholder image, and old profile subcomponents with a white identity card and the workspace's shared spacing, typography, borders, and blue accent. Profile now has keyboard-accessible Overview/Skills/Applications tabs, real work-experience rendering, contact/portfolio/GitHub links, shared five-item completion, and a resume panel. Missing avatars use a local initial. Structured experience arrays are rendered as rows rather than passed directly to React as text.

Added a native dialog profile editor with associated labels, schema errors, optional image upload, retained values on failure, pending state, Escape behavior, and Redux refresh after API success. Completion and header update immediately from returned account data. Replaced simulated resume progress/success with an actual multipart upload, validation, failure/retry UI, a current-resume link, and user-state refresh after confirmation.

Backend profile updates now support editing without a new image, retaining the current photo, JSON or comma-separated skills, deduplication, clearing optional fields, explicit error responses, and duplicate-email feedback. Resume upload returns a safe updated user response and uses Cloudinary auto resource type for supported document formats. Legacy API callers continue to receive the message and user fields.

Production build, targeted ESLint, and backend syntax checks pass. In-memory controller tests verified no-image saves/photo preservation, skills and empty optional fields, malformed skills rejection, and updated resume responses without database or Cloudinary writes. Playwright checked 1440, 1024, 768, 390, and 320 pixels without overflow or public shell, native editor validation/failure retention/save, keyboard tab navigation, Escape close, real-response-only resume failure/retry/success, structured experience, and completion refresh. API responses were browser fixtures; no real accounts or resume files were modified. Screenshots: output/playwright/profile-redesign-1440.png and profile-redesign-390.png. External live upload delivery remains unverified.
