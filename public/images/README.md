# Daranga Villa - Development Images Directory

This directory (`public/images/`) is reserved for placing local development images, villa photography, logos, and assets.

## Directory Structure

```text
public/
└── images/
    ├── hero/            # Hero background images & promotional banners
    ├── villas/          # Individual villa photos (exterior, bedrooms, pools)
    ├── experiences/     # Dining, spa, wellness, and activity photos
    └── gallery/         # General property & architectural photography
```

## Referencing Images in Next.js Code

In Next.js, any file inside the `public/` directory is automatically served relative to the root URL `/`.

### Example Usages:

```tsx
import Image from "next/image";

// Referencing a villa image placed in public/images/villas/celestial-villa.jpg
<Image
  src="/images/villas/celestial-villa.jpg"
  alt="The Celestial Residence"
  width={1200}
  height={800}
/>
```

```typescript
// In lib/data/villa-data.ts
imageUrl: "/images/villas/celestial-villa.jpg"
```

## Recommended Image Formats & Sizes
- **Formats**: `.jpg`, `.jpeg`, `.webp`, `.png`
- **Hero / Banners**: 2000px width (compressed `.webp` or `.jpg`)
- **Villa Cards**: 1200px × 800px
- **Gallery Grid**: 1000px × 750px
