# Security Policy

The/Hole/Truth is a public-interest tool used by journalists, advocates,
people with disabilities, and incarcerated requesters. A security bug here
can compromise people whose interactions with the government are already
adversarial. We take vulnerability reports seriously.

## Reporting a vulnerability

**Please do not file security issues as public GitHub issues.**

The preferred reporting path is GitHub's private vulnerability reporting:

- Go to the [Security tab → Advisories → Report a vulnerability](https://github.com/The-HOLE-Foundation/the-hole-truth/security/advisories/new).
- Private vulnerability reporting is enabled on this repository; the form
  reaches the maintainers without exposing the report publicly.

If GitHub's reporting flow is not available to you (for example, a corporate
network blocks it), email us:

- **security@theholefoundation.org** — monitored by the maintainers.

If that address bounces, the foundation's permanent inbox is not yet live;
file a private GitHub security advisory instead (link above). This file will
be updated the moment forwarding is wired up.

If you need to send sensitive material, say so in the first message and we
will arrange an encrypted channel before you send the details.

## What to include

To triage quickly, please include as much of the following as you can:

- A short description of the issue and its impact.
- Reproduction steps or a proof-of-concept.
- The affected commit, branch, deployment URL, or version.
- Your assessment of severity (we will independently assess as well).
- Whether you intend to publish a write-up, and on what timeline.

## What to expect from us

- **Acknowledgement:** within **3 business days** of your first report.
- **Initial triage and severity assessment:** within **7 business days**.
- **Fix or mitigation plan:** communicated within **14 days** for high-severity
  issues; longer for low-severity issues, with the timeline shared up front.
- **Public disclosure:** coordinated with you. We will not disclose your name
  or contact information without your permission. We will credit reporters in
  the security advisory unless you ask us not to.

## Supported versions

The/Hole/Truth is in **v0**. Only the current `main` branch is supported.
We do not backport security fixes to older commits or pre-release tags.

| Version | Supported          |
| ------- | ------------------ |
| `main`  | Yes                |
| anything else | No           |

This policy will be revisited the first time we cut a tagged release.

## Out of scope

The following are not in scope for security reports, though we still want to
hear about them through the normal issue tracker:

- Findings that require physical access to a maintainer's machine.
- Vulnerabilities in third-party services we link to (file those with the
  upstream vendor; we will help coordinate if needed).
- Reports based solely on the output of an automated scanner with no
  demonstrated impact.
- Self-XSS, clickjacking on pages without a sensitive action, or missing
  best-practice security headers on pages that do not handle sensitive data.

## Safe-harbor

We will not pursue legal action against good-faith security researchers who:

- Follow this policy.
- Avoid privacy violations, data destruction, and degradation of service for
  other users.
- Do not exploit a vulnerability beyond the minimum needed to demonstrate it.
- Give us a reasonable window to fix the issue before any public disclosure.

Thank you for helping protect the people who rely on this project.
