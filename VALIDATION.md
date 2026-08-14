# TuneCollab Validation Scope

The automated suite verifies deterministic application behavior, including upload validation, storage metadata, logout cleanup, discovery filters, collaboration invitations and ownership permissions, comment ownership, AI metadata normalization, and notification preference filtering. Run `pnpm check`, `pnpm test`, and `pnpm build` before every checkpoint.

Some release checks require an authenticated user session or infrastructure outside the local test runner. Perform these checks manually on the published domain before a public launch.

| Validation | Why it is environment-dependent | Required release action |
|---|---|---|
| OAuth end-to-end sign-in | It requires the real identity-provider redirect and a user-owned session. | Sign in from the published domain, restore the session after a refresh, and log out. |
| Cross-browser review | The managed preview uses Chromium; it cannot prove behavior in every browser engine. | Check the primary flows in a current Firefox and Safari release. |
| Email notifications | Delivery requires a configured mail provider, verified sender, and recipient preferences. | Configure a provider before enabling email delivery; in-app notifications remain available. |
| Dedicated monitoring | Third-party error tracking requires an account and project-specific credentials. | Choose a monitoring provider, provide its credential through managed secrets, and verify a non-sensitive test event. |

Do not mark these infrastructure-dependent checks complete solely from local tests. The current in-app notification inbox, managed deployment logs, and error boundary are available while these optional integrations are not configured.
