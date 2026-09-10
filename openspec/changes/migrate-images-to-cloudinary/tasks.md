# Tasks: Migrate Image Storage to Cloudinary

**Change:** `migrate-images-to-cloudinary`  
**Risk:** Low  
**Schema migration required:** No  
**PR strategy:** Single PR

---

## Phase 1 — Dependencies & Configuration

### TASK-1: Install Cloudinary SDK
- Run `npm.cmd install cloudinary`
- Verify `cloudinary` appears in `package.json` dependencies

### TASK-2 [done]: Update `.env.example`
- Add `# Cloudinary` section with:
  - `CLOUDINARY_CLOUD_NAME=your_cloud_name`
  - `CLOUDINARY_API_KEY=your_api_key`
  - `CLOUDINARY_API_SECRET=your_api_secret`

---

## Phase 2 — Server Endpoint

### TASK-3: Create signature endpoint
- Create `src/routes/api/cloudinary/signature/+server.ts`
- `GET` handler:
  - Check `event.locals.user` — return 401 if unauthenticated
  - Read `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` from `env` (SvelteKit `$env/static/private`)
  - Return 500 with descriptive message if any is missing
  - Use `cloudinary.v2.utils.api_sign_request()` to sign `{ folder: 'murci/products', timestamp }`
  - Return JSON `{ signature, timestamp, api_key, cloud_name, folder }`

---

## Phase 3 — Server Logic

### TASK-4 [done]: Refactor `product.ts`
- Remove imports: `import path from 'path'`, `import { promises as fs } from 'fs'`
- Remove functions: `handleImage()`, `checkDir()`
- Add helper: `extractPublicId(url: string): string` (strips version prefix and extension)
- Modify `deleteImg()`:
  - Remove `fs.unlink(filePath)` block
  - Add: `const publicId = extractPublicId(img.url)` → `await cloudinary.v2.uploader.destroy(publicId)`
  - Wrap Cloudinary call in try/catch — log error but always delete DB record (REQ-IMG-011)
- Modify `bindImg()`:
  - Change signature to `(productId: string, url: string)`
  - Remove `imgName` generation and `handleImage()` call
  - Insert `{ id: imgId, url, productId }` directly

### TASK-5 [done]: Delete local image serving route
- Delete `src/routes/imgs/[slug]/+server.ts`

---

## Phase 4 — Cleanup & Scripts

### TASK-6 [done]: Update `scripts/backup.js`
- Remove any logic that copies or archives files from `uploads/imgs/` into the backup ZIP
- Images are now in Cloudinary; the DB export captures URLs

### TASK-7 [done]: Update `scripts/restore.js`
- Remove any logic that extracts image files from ZIP to `uploads/imgs/`
- Only DB restore (JSON import) is needed

---

## Verification Checklist

- [ ] `npm.cmd run check` → 0 TypeScript errors
- [ ] `npm.cmd run build` → build succeeds
- [ ] Signature endpoint returns valid JSON when authenticated
- [ ] Signature endpoint returns 401 when unauthenticated
- [ ] `bindImg()` inserts a record with a Cloudinary `https://` URL
- [ ] `deleteImg()` calls Cloudinary Destroy and removes DB record
- [ ] Route `src/routes/imgs/[slug]/+server.ts` no longer exists
- [ ] `.env.example` contains all three Cloudinary variables
