# Tribune staging — read-only visual test build

The production-upgrade text files are copied from the isolated production-upgrade-staging branch. The staging site has no CNAME and does not change the production deployment.

## Safeguards
- Every copied HTML page loads `staging-readonly.js` before application scripts.
- The guard blocks non-GET browser fetch requests, non-GET XHR, sendBeacon, and form submission, and displays a STAGING banner.
- The edition publishing handler has an additional explicit early-return safety lock.
- Existing public images are displayed directly from https://fourthandfuckup.com/ instead of copying binaries.
- Staging readers still use the production published-editions table for read-only verification. **The browser guard is not a server-side database permission boundary.** Do not use staging to sign in, edit, moderate, publish, or submit personal information.

## Current test scope
- Ready for **public visual and read-only navigation testing only**, once GitHub Pages is enabled.
- Not approved for editor or database-write workflow testing. Those require a separately isolated Supabase test project or server-enforced read-only credentials.
- Do not publish any test editions or copy The Scandal Edition into production.
- Do not merge draft PR #5 or change live hosting.

## Pages setup (user action)
GitHub repository Settings > Pages > Build and deployment > Deploy from a branch > main > /(root) > Save.
Expected URL after GitHub Pages is active: https://fourthandfuckup.github.io/tribune-staging/ (verify before treating as live).
