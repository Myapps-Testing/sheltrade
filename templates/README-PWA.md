# Sheltrade Progressive Web App (PWA)

Sheltrade has been configured as a Progressive Web App (PWA) to provide a native app-like experience on supported devices.

## PWA Features

### ✅ Implemented Features
- **Web App Manifest**: Complete manifest.json with app metadata, icons, and display preferences
- **Service Worker**: Comprehensive offline caching, background sync, and push notifications
- **Install Prompt**: Automatic install banner for supported browsers
- **Offline Support**: Cached static assets and offline fallback pages
- **Background Sync**: Syncs pending transactions when connection is restored
- **Push Notifications**: Ready for push notification integration

### 📱 PWA Capabilities
- **Installable**: Can be installed on desktop and mobile devices
- **Offline First**: Core functionality works without internet connection
- **Fast Loading**: Cached resources for instant loading
- **Native Feel**: Standalone display mode, custom theme colors
- **Background Sync**: Handles offline actions when online

## File Structure

```
templates/
├── manifest.json          # PWA manifest file
├── sw.js                 # Service worker for caching and offline support
├── landing.html          # Main landing page with PWA meta tags
├── dashboard.html        # Dashboard with PWA meta tags
├── icons/                # App icons (need to be generated)
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-192x192.png
│   ├── icon-384x384.png
│   └── icon-512x512.png
└── screenshots/          # Store screenshots for manifest
    ├── dashboard.png
    └── mobile-dashboard.png
```

## Setup Instructions

### 1. Generate App Icons

You need to create the app icons in various sizes. Use a tool like:

- [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [Favicon.io](https://favicon.io/favicon-generator/)

Generate icons from a 512x512px source image and place them in the `icons/` folder.

### 2. Add Screenshots (Optional)

For better app store listings, add screenshots:
- `screenshots/dashboard.png` (1280x720 for wide screens)
- `screenshots/mobile-dashboard.png` (390x844 for mobile)

### 3. HTTPS Requirement

PWAs require HTTPS in production. Ensure your hosting supports SSL certificates.

### 4. Testing PWA

#### Browser DevTools
1. Open Chrome DevTools (F12)
2. Go to Application tab
3. Check Manifest and Service Workers sections
4. Test offline functionality in Network tab

#### Lighthouse Audit
1. Run Lighthouse audit in DevTools
2. Check PWA category score
3. Address any issues found

#### Manual Testing
- Install the PWA on desktop/mobile
- Test offline functionality
- Verify install prompt appears
- Check for console errors

## Service Worker Features

### Caching Strategy
- **Static Assets**: HTML, CSS, JS files cached immediately
- **Dynamic Content**: API responses cached on successful requests
- **Offline Fallback**: Serves cached landing page for navigation requests

### Background Sync
- Syncs pending transactions when connection restored
- Handles failed API calls gracefully

### Push Notifications
- Framework ready for push notification integration
- Custom notification actions (explore/close)

## Browser Support

### ✅ Full Support
- Chrome 70+
- Firefox 68+
- Safari 12.1+ (iOS 11.3+)
- Edge 79+

### ⚠️ Partial Support
- Older browsers may not support all PWA features

## Deployment Checklist

- [ ] Generate and add app icons
- [ ] Add app screenshots
- [ ] Test on multiple devices/browsers
- [ ] Verify HTTPS setup
- [ ] Test offline functionality
- [ ] Run Lighthouse PWA audit
- [ ] Test install process

## Troubleshooting

### Common Issues

1. **Service Worker Not Registering**
   - Check browser console for errors
   - Ensure sw.js is accessible
   - Verify HTTPS in production

2. **Install Prompt Not Showing**
   - Must be served over HTTPS
   - User must interact with page first
   - Check browser compatibility

3. **Offline Not Working**
   - Check cache storage in DevTools
   - Verify service worker is active
   - Test with Network tab set to offline

4. **Icons Not Loading**
   - Ensure correct file paths in manifest.json
   - Check icon file formats and sizes
   - Verify icons folder is accessible

## Future Enhancements

- [ ] Push notification server integration
- [ ] Advanced caching strategies
- [ ] App shortcuts for quick actions
- [ ] Periodic background sync
- [ ] Web Share API integration
