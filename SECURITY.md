# Security and privacy plan

## Current status

This repository is a static front-end prototype. It has no authentication, server, database, file upload, payment handling, AI provider, or connected ad accounts. Product and lead examples are held in browser memory and are not private customer records. Do not enter real customer data or secrets.

The `_headers` file applies security response headers on hosts that support the Cloudflare Pages-style headers file. GitHub Pages does not apply this file as response headers, so verify the deployed host's configuration rather than assuming these protections are active.

## Baseline safeguards included

- Avoid rendering user-entered text as HTML; use safe text APIs.
- External links that open new tabs use `rel="noopener noreferrer"`.
- Security header template in `_headers` for compatible static hosts.
- Keyboard skip link, visible focus, and accessible mobile navigation.
- No browser-side API keys or third-party account tokens.

## Required before real users or uploads

1. **Server-side authentication and authorization:** use a reputable identity provider; enforce tenant isolation and role-based access on every server request.
2. **Secure data layer:** use a managed database with row-level security, private-by-default records, validated schemas, least-privilege service credentials, encrypted transport, and tested backups.
3. **Uploads:** do not accept arbitrary uploads until server-side type/size checks, file-signature verification, malware scanning, randomized storage names, private/quarantined storage, download authorization, and retention/deletion controls exist. Never execute uploaded files.
4. **AI integrations:** call AI providers from server-side functions only. Keep keys in encrypted environment secrets. Treat prompts, uploads, retrieved pages, and model output as untrusted. Validate output and require confirmation before publishing or taking consequential actions.
5. **Website publishing and domains:** verify ownership before deployment or DNS changes; use scoped tokens, preview environments, audit logs, rollback, and explicit confirmation for production publication.
6. **Marketing and ads:** use official OAuth flows and minimal scopes, protect refresh tokens server-side, set hard spend limits, log changes, and require user approval before launching campaigns or increasing budgets.
7. **SEO / Google:** provide official Search Console and Analytics links and guided setup. Never ask users to paste Google passwords or promise indexing or rankings. Real submissions require authorized integrations.
8. **Operational security:** enable MFA for maintainers, protect the GitHub account, review dependencies, scan for leaked secrets, pin/review build actions, maintain an incident-response process, and test restore procedures.
9. **Privacy and compliance:** publish a clear privacy notice, terms, cookie/analytics disclosures where applicable, contact/deletion process, and data-retention policy before onboarding customers.

## Deployment checklist

- [ ] Choose and configure a production host.
- [ ] Confirm HTTPS and inspect actual response headers with a security-header scanner.
- [ ] Verify CSP against the deployed app and remove exceptions that are not needed.
- [ ] Add authentication, tenant authorization, server-side validation, rate limiting, and abuse protection before exposing private data or uploads.
- [ ] Test keyboard navigation, mobile layout, contrast, and screen-reader labels.
- [ ] Run dependency and secret scans.
- [ ] Test authorization failures, malicious inputs, oversized files, and cross-tenant access.
- [ ] Document data export, deletion, backup, and incident response.

**Important:** security cannot be guaranteed by a front-end file alone. Have the production backend, identity, upload, and publishing flows reviewed before handling real users or business data.
