# Reusable Media Management & Storage Foundation

## Overview
The Media Foundation is the centralized, reusable image management and object storage system for QR Dine SaaS. It enforces client-side EXIF stripping, WebP conversion, quality compression (80–85%), responsive variant generation, format/size validation, orphan storage cleanup, and CDN URL resolution across all modules.

---

## 1. Storage Folder Structure
Storage objects are organized predictably within the `menu-images` bucket under tenant-isolated paths:

```
restaurants/
└── {restaurantId}/
    ├── logos/
    │   └── {entityId}/ { original.webp, thumb.webp, small.webp }
    ├── categories/
    │   └── {entityId}/ { original.webp, thumb.webp, small.webp, medium.webp }
    ├── menu/
    │   └── {entityId}/ { original.webp, thumb.webp, small.webp, medium.webp, large.webp }
    ├── staff/
    │   └── {entityId}/ { original.webp, thumb.webp, small.webp }
    ├── banners/
    │   └── {entityId}/ { original.webp, small.webp, medium.webp, large.webp }
    ├── offers/
    │   └── {entityId}/ { original.webp, small.webp, medium.webp }
    └── qr/
        └── {entityId}/ { original.png, thumb.png }
```

---

## 2. Compression & Image Processing Pipeline
1. **Client-Side Canvas Processing**: Files uploaded via `<MediaUploader />` or `mediaService.uploadImage()` are processed via HTML5 Canvas before network transmission.
2. **Metadata Stripping**: Redraw on Canvas automatically strips privacy-sensitive EXIF metadata (GPS tags, device model, camera settings).
3. **Format Standardisation**: Supported source formats (`.jpg`, `.jpeg`, `.png`, `.webp`) are encoded as compressed WebP Blobs.
4. **Target Quality**: Applied per entity preset (default 80–85%).
5. **Responsive Image Variants**:
   - `thumb`: 150x150 center-crop square
   - `small`: 400px maximum dimension
   - `medium`: 800px maximum dimension
   - `large`: 1600px maximum dimension

---

## 3. Entity Presets & Validation Limits

| Preset | Allowed Formats | Max File Size | Target Quality | Responsive Variants |
| :--- | :--- | :--- | :--- | :--- |
| `logo` | JPG, JPEG, PNG, WebP | 2 MB | 85% | `thumb`, `small` |
| `category` | JPG, JPEG, PNG, WebP | 2 MB | 80% | `thumb`, `small`, `medium` |
| `menu` | JPG, JPEG, PNG, WebP | 5 MB | 82% | `thumb`, `small`, `medium`, `large` |
| `banner` | JPG, JPEG, PNG, WebP | 8 MB | 85% | `small`, `medium`, `large` |
| `staff` | JPG, JPEG, PNG, WebP | 2 MB | 80% | `thumb`, `small` |
| `offer` | JPG, JPEG, PNG, WebP | 4 MB | 82% | `small`, `medium` |
| `qr` | PNG, WebP, JPG, SVG | 2 MB | 95% | `thumb`, `small` |

---

## 4. Replacement & Deletion Flows

### Replacement Flow
1. Upload new image file and generate new responsive variants.
2. Confirm new storage upload succeeded.
3. Update entity reference and `public.media_assets` database metadata record.
4. Asynchronously delete old storage objects (main + variants) via `mediaService.replaceImage()` to eliminate orphaned files.

### Deletion Flow
1. Retrieve main storage path and variant path map from `public.media_assets`.
2. Soft-delete database record (`deleted_at = now()`).
3. Call `storageAdapter.deleteMany()` to purge all storage objects from object storage.

---

## 5. URL Generation & Future CDN Migration
- **Centralized Resolution**: All image URL building flows through `UrlBuilder.getPublicUrl()` and `UrlBuilder.buildMediaUrls()`.
- **Future CDN Provider Migration**: To switch from InsForge Storage URLs to Cloudflare R2 / CloudFront / Fastly CDN:
  ```typescript
  import { UrlBuilder } from '@qrdine/lib';
  
  // Set custom CDN domain prefix globally
  UrlBuilder.setCdnBaseUrl('https://cdn.qrdine.com');
  ```
  No application feature code needs to be modified.

---

## 6. Component Reference

### `<AppImage />`
Enterprise image component supporting:
- Lazy-loading (`loading="lazy"`)
- Skeleton blur loading state
- Responsive `srcset` support
- Auto-fallback to inline SVG placeholders (`logo`, `category`, `menu`, `staff`, `banner`, `offer`, `qr`, `broken`)
- Smooth opacity fade-in once loaded.

### `<MediaUploader />`
Drag-and-drop upload component supporting:
- Instant preset validation (size, MIME, corruption)
- Client-side WebP compression preview showing before/after size reduction
- Progress indicator
- Clear and replace actions.
