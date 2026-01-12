# PWA Installation Guide

## Key Differences: Android vs iOS

### Android Installation
✅ **Automatic Install Prompt**
- Chrome/Edge automatically shows "Add to Home Screen" banner
- Can be triggered programmatically via `beforeinstallprompt` event
- Users see a system-level install dialog

### iOS Installation (Safari)
⚠️ **Manual Installation Only**
- iOS Safari does NOT support automatic install prompts
- No `beforeinstallprompt` event support
- Users must manually install via the Share menu

## How to Install on iOS

### Step-by-Step Instructions for iOS Users:

1. **Open Safari** on your iPhone/iPad
   - Navigate to your app URL
   
2. **Tap the Share Button** 
   - Look for the square with an arrow pointing up (at the bottom of Safari)
   
3. **Scroll down and tap "Add to Home Screen"**
   - You should see your app icon and name
   
4. **Tap "Add" in the top right corner**
   - The app will now appear on your home screen

### Visual Indicators that PWA is Ready:

✅ Icon displays correctly (512x512 PNG)
✅ App name shows: "SalesTracker"
✅ Theme color is set (#0f172a - dark blue)

## What We've Implemented

### iOS-Specific Meta Tags:
```tsx
appleWebApp: {
  capable: true,                        // Enables standalone mode
  statusBarStyle: "black-translucent",  // Status bar styling
  title: "SalesTracker",                // App title on home screen
}
```

### Apple Touch Icon:
```tsx
icons: {
  apple: '/apple-touch-icon.png',  // High-res icon for iOS
}
```

### Manifest Configuration:
- ✅ `display: "standalone"` - Runs without browser UI
- ✅ `start_url: "/dashboard"` - Opens directly to dashboard
- ✅ `orientation: "portrait"` - Locks to portrait mode
- ✅ `theme_color` & `background_color` - Consistent theming

## Testing Your PWA

### Android (Chrome/Edge):
1. Visit the site
2. Wait for install prompt OR
3. Menu → "Install app" or "Add to Home Screen"

### iOS (Safari):
1. Visit the site in Safari
2. Share → "Add to Home Screen"
3. Verify icon and name appear correctly
4. Tap "Add"

## Troubleshooting

### iOS: "Add to Home Screen" option is grayed out?
- ✅ Make sure you're using **Safari** (not Chrome or Firefox)
- ✅ Ensure you're NOT in Private Browsing mode
- ✅ Verify manifest.json is accessible at `/manifest.json`
- ✅ Check that apple-touch-icon.png exists at `/apple-touch-icon.png`

### Icon not showing on iOS?
- Clear Safari cache
- Hard refresh the page (pull down to refresh)
- Check that `/apple-touch-icon.png` is a valid PNG file (512x512)

### App opens in Safari instead of standalone?
- Uninstall and reinstall the PWA
- Verify `"display": "standalone"` in manifest.json
- Check `appleWebApp.capable: true` in metadata

## Important iOS Limitations

❌ **No Install Prompt** - Cannot programmatically trigger install
❌ **Safari Only** - Other iOS browsers cannot install PWAs
❌ **No Notification Badge** - iOS doesn't support PWA notification badges
⚠️ **Limited Storage** - Cache storage may be cleared more aggressively
⚠️ **No Background Sync** - Background sync API not supported on iOS

## Files Involved

- `src/app/layout.tsx` - PWA metadata and iOS configuration
- `public/manifest.json` - PWA manifest
- `public/apple-touch-icon.png` - iOS home screen icon (512x512)
- `public/icon-192.png` - Android icon (192x192)
- `public/icon-512.png` - Android icon (512x512)
- `public/sw.js` - Service worker for offline functionality
- `src/components/PwaLifecycle.tsx` - Service worker registration

## Need More Help?

If users on iOS still can't see the "Add to Home Screen" option:
1. Verify they're using Safari (iOS default browser)
2. Make sure they're on iOS 11.3 or later
3. Check that HTTPS is enabled (PWAs require secure context)
4. Ensure manifest.json is being served with correct MIME type (`application/manifest+json`)
