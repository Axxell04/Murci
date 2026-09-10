# Design: Migrate Image Storage to Cloudinary

## Architecture Decisions

### ADR-1: Signed uploads over unsigned presets

**Decision:** Use server-generated HMAC signatures for every upload request.  
**Rationale:** Unsigned upload presets allow anyone with the preset name and cloud name to upload arbitrary content to the account, consuming bandwidth and storage quota. Signed uploads expire in 60 minutes and are scoped to a specific folder, providing upload authorization without exposing credentials.  
**Consequence:** One extra HTTP round-trip per upload (GET /api/cloudinary/signature before the actual upload). Acceptable for an admin-only flow.

### ADR-2: Cloudinary Node SDK for server-side operations only

**Decision:** Install `cloudinary` npm package and use it exclusively on the server (signature generation, Destroy API). The browser uses the raw Cloudinary Upload API (via fetch or Upload Widget), not the SDK.  
**Rationale:** The SDK includes server-side utilities (signature, admin API) not needed on the browser. Keeping it server-side avoids bundling it into the client.

### ADR-3: Derive public_id from stored URL for deletion

**Decision:** Extract the `public_id` from the `secure_url` string at deletion time rather than storing `public_id` as a separate column.  
**Rationale:** Avoids a schema migration. The `public_id` is deterministically derivable from the URL format:  
`https://res.cloudinary.com/<cloud>/image/upload/v<version>/<path>` → `<path>` (without extension) is the `public_id`.  
**Consequence:** If Cloudinary changes their URL format (unlikely), the extractor would need an update. Acceptable tradeoff.

### ADR-4: Cloudinary folder structure

**Decision:** Upload all product images to the `murci/products` folder in Cloudinary.  
**Rationale:** Isolates project assets from other Cloudinary account content. Makes bulk operations (purge all, backup via API) straightforward.

### ADR-5: Keep img.url as a full absolute URL

**Decision:** Store the full `secure_url` from Cloudinary (e.g., `https://res.cloudinary.com/...`) instead of just the `public_id`.  
**Rationale:** The frontend can use the URL directly in `<img src>` with zero transformation. No lookup function needed at render time. Consistent with the original approach of storing an addressable URL.

---

## Implementation Map

### New: `src/routes/api/cloudinary/signature/+server.ts`

```ts
// Endpoint: GET /api/cloudinary/signature
// Auth: requires event.locals.user (admin only)
// Returns: { signature, timestamp, api_key, cloud_name, folder }
// Uses: cloudinary.v2.utils.api_sign_request()
```

### Modified: `src/lib/server/product.ts`

- **Remove:** `handleImage()`, `checkDir()`, `import path`, `import fs`
- **Modify `bindImg()`:** signature changes from `(productId, img: File)` to `(productId, url: string)`. Generates `imgId`, inserts `{ id, url, productId }` directly.
- **Modify `deleteImg()`:** replaces `fs.unlink(filePath)` with a Cloudinary Destroy call. Extracts `public_id` from `img.url` using a helper function `extractPublicId(url: string): string`.

### Deleted: `src/routes/imgs/[slug]/+server.ts`

No replacement needed. The `<img src>` in the frontend will point to the Cloudinary CDN URL directly.

### Modified: `.env.example`

Add three new variables in a `# Cloudinary` section:
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Modified: `scripts/backup.js` and `scripts/restore.js`

- `backup.js`: Remove the `archiver` / `fs` logic that copies `uploads/imgs/` into the ZIP archive.
- `restore.js`: Remove the logic that extracts image files from ZIP to `uploads/imgs/`.

---

## Public ID Extraction Logic

```ts
// "https://res.cloudinary.com/<cloud>/image/upload/v<timestamp>/<folder>/<name>.webp"
// → "<folder>/<name>"
function extractPublicId(url: string): string {
  const uploadIndex = url.indexOf('/upload/');
  if (uploadIndex === -1) return url;
  const afterUpload = url.slice(uploadIndex + '/upload/'.length);
  // Strip version prefix (v<digits>/)
  const withoutVersion = afterUpload.replace(/^v\d+\//, '');
  // Strip file extension
  return withoutVersion.replace(/\.[^/.]+$/, '');
}
```

---

## Data Flow Diagram

```
[Admin Browser]
    │
    ├─── GET /api/cloudinary/signature ──────────────────► [SvelteKit Server]
    │         (auth check + sign request)                        │
    │◄── { signature, timestamp, api_key, cloud_name, folder } ◄┘
    │
    ├─── POST https://api.cloudinary.com/v1_1/<cloud>/image/upload
    │         (with signed params + image file)
    │◄── { secure_url, public_id, ... }
    │
    └─── POST /admin/products (SvelteKit form action)
              body: { productId, url: secure_url }
                   └─► bindImg(productId, secure_url)
                            └─► db.insert(img)
```
