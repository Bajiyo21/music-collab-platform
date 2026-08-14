# TuneCollab Production Guide

TuneCollab is a full-stack React, tRPC, and Drizzle application with object-storage-backed media and OAuth-based sessions. For this project, saving a managed checkpoint also publishes the version because auto-publish is enabled.

## Release Procedure

Run the following commands from the project root before creating a checkpoint.

```bash
pnpm test
pnpm check
pnpm build
```

Stop the release if any command fails. Visually confirm Home, Explore, Upload, Dashboard, AI Studio, track detail, Collaboration Hub, and a collaboration room at desktop and mobile widths. Verify signed-out navigation and signed-in creation flows when an authenticated session is available.

## Security and Storage

Audio and cover-art uploads are received by the server, validated, and written to S3-compatible object storage. The related track record contains the storage key/URL, file metadata, and SHA-256 checksum. The checksum verifies the received file and detects exact duplicate uploads; it is not copyright registration, a legal ownership determination, or legal advice.

Keep secrets in the managed project settings rather than source control. Do not add private database, OAuth, storage, or server-side AI credentials to browser code. Apply schema changes through the Drizzle workflow and the managed database migration process.

## Publishing and Domain Management

1. Create a successful checkpoint after verification. Auto-publish makes that version live immediately for this project.
2. In **Settings → Domains**, enter the preferred custom domain and follow the supplied DNS validation instructions.
3. Retain the managed domain during the DNS transition so creators retain an accessible route while propagation completes.
4. Confirm sign-in callbacks, public track links, and uploaded media on the assigned domain after DNS is active.

## Monitoring and Recovery

Use the project dashboard and production log view to monitor release health. For local development diagnostics, inspect `.manus-logs/devserver.log`, `.manus-logs/browserConsole.log`, and `.manus-logs/networkRequests.log`.

If a regression reaches production, restore the latest healthy checkpoint through version history. Do not use destructive source-control resets as a recovery mechanism, and remember that a database schema rollback may require a separate, carefully reviewed migration.

## Functional Release Checklist

- [ ] Confirm OAuth sign-in, session restoration, and logout.
- [ ] Confirm upload MIME/size validation and exact duplicate detection.
- [ ] Confirm public discovery, artist recommendations, queue playback, shuffle, and repeat.
- [ ] Confirm favorites, comments, and share links.
- [ ] Confirm invitation acceptance and that an unrelated contributor cannot remove another musician’s layer.
- [ ] Confirm AI outputs are displayed as editable suggestions, not automatic track metadata changes.
- [ ] Confirm light/dark theme persistence and responsive layouts.
