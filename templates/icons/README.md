# App Icons

This folder should contain the PWA app icons in various sizes.

## Required Icons

Generate these icons from a single 512x512px source image using a tool like:

- [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)

## Icon Specifications

| Size    | File Name        | Purpose               |
| ------- | ---------------- | --------------------- |
| 72x72   | icon-72x72.png   | Android, any maskable |
| 96x96   | icon-96x96.png   | Android, any maskable |
| 128x128 | icon-128x128.png | Android, any maskable |
| 144x144 | icon-144x144.png | Android, any maskable |
| 152x152 | icon-152x152.png | iOS, any maskable     |
| 192x192 | icon-192x192.png | Android, any maskable |
| 384x384 | icon-384x384.png | Android, any maskable |
| 512x512 | icon-512x512.png | Android, any maskable |

## Icon Guidelines

- Use PNG format
- Ensure icons have transparent backgrounds where appropriate
- For maskable icons, include safe zone padding (80% of icon size)
- Test icons on various devices and backgrounds

## Generation Command (Example)

```bash
npx pwa-asset-generator logo.png icons/ --manifest manifest.json --background "#0f172a"
```

Replace `logo.png` with your source logo file.
