# Admin dashboard refactor TODO

## Goal
- Update admin dashboard navbar to show application name above it (already done).
- Refactor admin modules into individual pages (separate components per module).

## Steps
1. Restore `frontend/src/views/dashboards/AdminDashboard.jsx` to a clean working baseline (revert partial JSX-conditional changes).
2. Create `frontend/src/views/dashboards/admin/` folder with separate page components:
   - AdminOverviewPage.jsx
   - AdminUsersPage.jsx
   - AdminCertificatesPage.jsx
   - AdminAnalyticsPage.jsx
   - AdminRolesPage.jsx
   - AdminBroadcastPage.jsx
3. Update `AdminDashboard.jsx` to render one page at a time based on `section` state (no anchor scrolling).
4. Ensure all existing admin actions/data (loadAdmin, togglePerm, addUser, saveUser, removeUser, approveCertificate, publishAnnouncement, etc.) are passed as props to page components.
5. Run `npm --prefix frontend run build` to verify.

