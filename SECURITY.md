# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 6.x     | ✅ Active           |
| < 6.0   | ❌ Not supported    |

## Reporting a Vulnerability

If you discover a security vulnerability, **please do not open a public GitHub issue.**

Instead, report it privately by emailing **[your-email@example.com]** with:

- A description of the vulnerability and its potential impact
- Steps to reproduce the issue
- Any proof-of-concept code (if applicable)

You can expect an acknowledgement within **48 hours** and a fix timeline within **7 days** for critical issues.

## Security Practices in ANTON

- **Passwords** are hashed with `bcrypt` via `passlib` — plain-text passwords are never stored.
- **JWT tokens** are signed with `HS256` and expire after 7 days.
- **Secret keys** are loaded exclusively from environment variables — never hard-coded.
- The **Admin endpoint** (`/admin/users`) requires a separate `X-Admin-Key` header.
- **CORS** is currently open (`allow_origins=["*"]`) for development convenience. Restrict this before any production deployment.

## Responsible Disclosure

We follow the principle of responsible disclosure. Once a fix is released, we will credit the reporter (if desired) in the release notes.
