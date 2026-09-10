# Spec: Cloudinary Image Storage

**Domain:** `images-cloudinary`  
**Status:** `draft`  
**Version:** 1.0.0

---

## Purpose
Define the contract for image upload, retrieval, and deletion using Cloudinary as the storage backend, replacing the local filesystem approach.

---

## Requirements

### Upload Flow

**REQ-IMG-001** The system MUST expose a server endpoint `GET /api/cloudinary/signature` that returns a valid Cloudinary signed upload payload.

**REQ-IMG-002** The signature endpoint MUST include at minimum: `signature`, `timestamp`, `api_key`, `cloud_name`, and `folder`.

**REQ-IMG-003** The signature MUST be computed server-side using the Cloudinary `api_secret`. The `api_secret` MUST NOT be exposed to the browser.

**REQ-IMG-004** The signed payload MUST expire after a maximum of 60 minutes (Cloudinary default).

**REQ-IMG-005** The frontend MUST upload the image file directly to Cloudinary using the signed payload. Image bytes MUST NOT be sent to the SvelteKit server.

**REQ-IMG-006** After a successful upload, the frontend MUST receive a `secure_url` from Cloudinary and persist it by calling a SvelteKit server action.

**REQ-IMG-007** The `secure_url` stored in the database MUST use `https://` scheme.

### Database Persistence

**REQ-IMG-008** The `img.url` column MUST store the full Cloudinary `secure_url` (e.g., `https://res.cloudinary.com/<cloud>/image/upload/v<timestamp>/<folder>/<public_id>.webp`).

**REQ-IMG-009** To support future deletion, the system SHOULD be able to derive the `public_id` from the stored `secure_url`.

### Deletion Flow

**REQ-IMG-010** When an image is deleted, the system MUST call the Cloudinary Destroy API to remove the asset from cloud storage.

**REQ-IMG-011** If the Cloudinary Destroy call fails (network error, invalid public_id), the system MUST still delete the database record to avoid orphaned references in the UI.

**REQ-IMG-012** The `deleteImg` function MUST NOT perform any filesystem operations (`fs.unlink`, `path.join`, etc.).

### Environment Variables

**REQ-IMG-013** The following environment variables MUST be defined:
- `CLOUDINARY_CLOUD_NAME`: The Cloudinary cloud name.
- `CLOUDINARY_API_KEY`: The Cloudinary API key (public, safe for frontend read if needed).
- `CLOUDINARY_API_SECRET`: The Cloudinary API secret. MUST be kept server-side only.

**REQ-IMG-014** The application MUST throw a clear startup error if any of these variables are missing when the signature endpoint is called.

### Local File Serving

**REQ-IMG-015** The route `src/routes/imgs/[slug]/+server.ts` MUST be deleted. Images MUST be served directly from the Cloudinary CDN URL stored in the database.

**REQ-IMG-016** No server-side proxying of image bytes is allowed. All image traffic goes directly from the browser to Cloudinary's CDN.

### Backup & Restore

**REQ-IMG-017** Backup operations MUST NOT include image file exports to disk. Images are persisted in Cloudinary and referenced by URL in the database export.

**REQ-IMG-018** Restore operations MUST NOT attempt to copy image files from a ZIP archive. Restoring the database JSON is sufficient to restore image references.

---

## Acceptance Scenarios

### Scenario 1: Successful image upload

```
Given a user is on the product management page
When they select an image file via the Upload Widget
Then the frontend calls GET /api/cloudinary/signature
And receives a valid signature payload
And uploads the file directly to Cloudinary (no bytes sent to SvelteKit)
And Cloudinary returns a secure_url
And the frontend submits the secure_url to the SvelteKit form action
And the img record is inserted in the database with that url
```

### Scenario 2: Image deletion

```
Given an img record exists with url "https://res.cloudinary.com/..."
When deleteImg(id) is called
Then the public_id is extracted from the url
And the Cloudinary Destroy API is called with that public_id
And the img record is deleted from the database
And no filesystem operations are performed
```

### Scenario 3: Cloudinary Destroy fails

```
Given an img record exists
When deleteImg(id) is called and the Cloudinary Destroy API returns an error
Then the error is logged
And the img record is still deleted from the database
And no exception is thrown to the caller
```

### Scenario 4: Missing environment variable

```
Given CLOUDINARY_API_SECRET is not set
When GET /api/cloudinary/signature is called
Then the endpoint returns HTTP 500
And a descriptive error message is returned
```

### Scenario 5: Images render correctly after migration

```
Given an img record with url "https://res.cloudinary.com/..."
When a product page renders the image
Then the <img> src attribute uses the stored Cloudinary URL directly
And no request is made to /imgs/[slug]
```
