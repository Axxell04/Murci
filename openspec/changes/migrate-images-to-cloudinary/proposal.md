# Proposal: Migrate Image Storage to Cloudinary

## Status
`proposed`

## Problem
Images are currently stored on the local filesystem under `uploads/imgs/`. This approach has three critical problems:

1. **Incompatible with serverless deployments**: Vercel's filesystem is ephemeral and read-only at runtime. Any image written via `fs.writeFile` is lost on the next deployment.
2. **Payload size limit**: Vercel limits server-side request bodies to ~4.5 MB. Large product images pass through SvelteKit, consuming memory and hitting limits.
3. **No CDN**: Images are served from the SvelteKit server itself (`/imgs/[slug]`), adding latency and bandwidth cost.

## Proposed Solution
Replace local filesystem storage with **Cloudinary** using a **signed direct-upload** flow:

1. The frontend requests a short-lived upload signature from a SvelteKit server endpoint.
2. The server generates the signature using Cloudinary credentials — **no image bytes touch the server**.
3. The frontend uploads directly to Cloudinary via the Upload Widget.
4. Cloudinary returns a `secure_url`. The frontend sends that URL to a SvelteKit form action to persist it in the database.
5. On delete, the server calls Cloudinary's Destroy API using the image's `public_id` derived from the URL.

## Scope
### In scope
- Add `cloudinary` Node.js SDK to `package.json`.
- New server endpoint `POST /api/cloudinary/signature` to generate signed upload params.
- Replace `handleImage()` in `src/lib/server/product.ts` with Cloudinary destroy logic only.
- Remove `checkDir()` and `fs` imports from `product.ts`.
- Replace `bindImg()` flow: no longer accepts a `File`, now accepts a `secure_url` string and optional `public_id`.
- Delete the local file-serving route `src/routes/imgs/[slug]/+server.ts` (images now served from Cloudinary CDN).
- Update `.env.example` with Cloudinary credentials.
- Update `backup.js` / `restore.js` to skip image file handling (images live in Cloudinary, not on disk).

### Out of scope
- Migrating existing images already stored on disk to Cloudinary.
- The Upload Widget UI component (frontend-only concern, handled separately).
- Cloudinary transformations / presets configuration (can be done via Cloudinary dashboard).

## Affected Files
| File | Change |
|---|---|
| `src/lib/server/product.ts` | Remove `handleImage`, `checkDir`, `fs` imports; `deleteImg` calls Cloudinary Destroy API; `bindImg` accepts `url` string |
| `src/routes/imgs/[slug]/+server.ts` | **Delete** — no longer needed |
| `src/routes/api/cloudinary/signature/+server.ts` | **Create** — generates signed upload params |
| `.env.example` | Add `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` |
| `scripts/backup.js` | Remove image filesystem export logic |
| `scripts/restore.js` | Remove image filesystem restore logic |

## Risk
**Low** — No database schema changes. The `img.url` column already stores a string URL. Switching from a relative path (`/imgs/foo.webp`) to an absolute Cloudinary URL (`https://res.cloudinary.com/...`) is a pure data-layer concern with no DB migration needed.
