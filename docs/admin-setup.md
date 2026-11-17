# Admin access

Admin accounts use the normal `/login` form and open `/admin/dashboard`. Public registration permits only Company and Jobseeker. API permissions check the current database account on every authenticated request, including suspension and role changes.

Create a new admin from a trusted terminal:

```powershell
cd backend
node scripts/create-admin.cjs
```

Enter the name, email, and password when prompted. Password input is hidden. The script uses the existing backend MongoDB configuration and refuses to overwrite or convert an existing account. No default admin credentials are shipped.

The admin workspace provides platform counts, searchable paginated user/company/job/application/contact lists, record details, profile and job editing, account suspension/reactivation, job removal/restoration, application statuses, and enquiry statuses. Admin accounts cannot be suspended through the management API. Passwords and OTPs are excluded from admin responses. Job removal preserves application history. Company chat remains a local preview; the admin Inbox contains real contact-form enquiries.
