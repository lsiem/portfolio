# Required Images for SEO and Favicons

The following images need to be added to the `/public` directory for optimal SEO and user experience:

## Social Media / Open Graph Image
- **`og-image.jpg`** - Recommended size: 1200x630 pixels
  - Used for social media previews (Facebook, Twitter, LinkedIn, etc.)
  - Should contain your name, title, or a professional photo
  - Currently referenced in `index.html` meta tags

## Favicons
- **`apple-touch-icon.png`** - Size: 180x180 pixels
  - Used for iOS home screen icons

- **`favicon-32x32.png`** - Size: 32x32 pixels
  - Standard favicon for modern browsers

- **`favicon-16x16.png`** - Size: 16x16 pixels
  - Smaller favicon for browser tabs

## Notes
- All images should be optimized for web (compressed)
- The `vite.svg` is currently being used as fallback, but dedicated favicons are recommended
- You can generate favicons from a single source image using tools like:
  - https://realfavicongenerator.net/
  - https://favicon.io/
