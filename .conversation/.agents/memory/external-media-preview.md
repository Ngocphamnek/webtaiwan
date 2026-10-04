---
name: External media in preview
description: Reliability of remote images in the app preview.
---

Avoid relying on remote image CDNs for user-visible media in this project; requests can fail with `ERR_CONNECTION_RESET`, while bundled assets are served reliably.

**Why:** Both the shell and browser preview were unable to retrieve an Unsplash image during a real test.

**How to apply:** Prefer images already bundled in the project or user-provided assets; verify visible media in the app preview after changes.