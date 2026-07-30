# QR Dine SaaS - Media Optimization Pipeline & Architecture

## Overview
The QR Dine Media Service manages media upload, validation, adaptive client-side compression, responsive variant generation, and storage syncing for the QR Dine SaaS platform.

It is designed to give users an instantaneous, Instagram/WhatsApp-like upload experience: accept images up to **50 MB**, automatically strip EXIF metadata, scale to target dimensions, and iteratively compress to adaptive file size targets in WebP format before uploading to InsForge Storage.

---

## 1. Upload Flow Overview

```
[ User Selects / Drops File (Up to 50 MB) ]
                     │
                     ▼
  [ 1. MediaValidator.validateFile() ]
  ├─ Check MIME type (JPG, PNG, WebP)
  ├─ Enforce 50 MB safety cap (prevent browser crashes)
  └─ Decode test (ensure no corrupted file)
                     │
                     ▼
  [ 2. Instant Local Preview ]
  └─ URL.createObjectURL(file) -> Render immediately in UI
                     │
                     ▼
  [ 3. ImageProcessor.processImage() (Client-Side) ]
  ├─ Canvas redraw -> Strip EXIF metadata
  ├─ Scale to target entity dimensions
  ├─ Adaptive Compression Loop (Quality & dimension scaling)
  └─ Generate Responsive WebP Variants (thumb, small, medium, large)
                     │
                     ▼
  [ 4. InsForgeStorageAdapter.upload() ]
  ├─ Upload compressed original WebP blob
  └─ Upload generated variant blobs
                     │
                     ▼
  [ 5. DB Metadata Record Sync ]
  └─ Persist record to `media_assets` PostgreSQL table
```

---

## 2. Adaptive Compression Strategy

Instead of compressing every image to a single arbitrary size or quality rating, QR Dine employs an **Adaptive Compression Loop**:

1. **Target Dimensions & Ranges**:
   - **Restaurant Logo**: Target `512 × 512 px`, Range `100 KB – 200 KB`
   - **Category Image**: Target `800 × 800 px`, Range `150 KB – 300 KB`
   - **Menu Item**: Target `1200 × 1200 px`, Range `200 KB – 400 KB`
   - **Cover Banner**: Target `1920 × 800 px`, Range `300 KB – 700 KB`
   - **Staff / User**: Target `512 × 512 px`, Range `100 KB – 200 KB`
   - **Promotional Offer**: Target `1200 × 1200 px`, Range `200 KB – 400 KB`

2. **Iterative Quality Convergence**:
   - The processor starts at an initial quality of `0.84 - 0.86`.
   - If compressed size exceeds the target maximum, quality steps down by `0.05` per iteration until a quality floor of `0.30` is hit.
   - If quality floor is reached and file size remains over target, canvas dimensions scale down by `20%` and quality resets to attempt re-compression.
   - If file size is below minimum target, quality steps up by `0.03` to maximize visual fidelity.

---

## 3. Responsive Image Variants

For every uploaded asset, responsive variants are pre-rendered client-side:

- **Thumb**: `150 × 150 px` (Square center-crop, used for mini lists, carts)
- **Small**: `400 px` max width (Mobile card grids)
- **Medium**: `800 px` max width (Tablet views, detailed dialogs)
- **Large**: `1600 px` max width (Desktop hero displays, full screen view)

`UrlBuilder.buildMediaUrls()` constructs responsive HTML `srcset` strings automatically for frontend `<img srcset="...">` integration.

---

## 4. Storage & URL Resolution

- Storage adapter returns the exact public URL (`data.url`) and storage key (`data.key`) provided by InsForge Storage.
- `UrlBuilder.getPublicUrl()` uses `insforge.storage.from(bucket).getPublicUrl(path)` to ensure accurate CDN and bucket path resolution without 404 broken link issues.

---

## 5. Future Roadmap: AVIF Support

- **AVIF Adoption**: When browser canvas export support for `image/avif` reaches full baseline stability across iOS Safari and Chromium, `ImageProcessor.canvasToBlob()` can fall back dynamically between `image/avif` and `image/webp`. This will yield an additional **20% - 30% file size reduction** at equal visual fidelity.
