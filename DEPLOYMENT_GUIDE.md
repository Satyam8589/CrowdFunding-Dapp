# Cross-Site Deployment Guide

This guide helps you deploy your CrowdFunding DApp to different hosting platforms without compatibility issues.

## ✅ Fixes Applied

### 1. **Client-Side Rendering (CSR) Protection**

- Added `isClient` state to prevent server-side rendering issues
- All `window` object access is wrapped in client-side checks
- Components only render after client-side mounting

### 2. **Web3 Provider Compatibility**

- Graceful fallback to public RPC when MetaMask isn't available
- Proper error handling for different wallet states
- Cross-browser compatibility for Web3 providers

### 3. **SSR/Hydration Fixes**

- Prevented hydration mismatches by checking `typeof window !== 'undefined'`
- Dynamic imports for client-only components
- Proper useEffect dependencies for client-side operations

## 🚀 Deployment Options

### **Option 1: Vercel (Recommended)**

```bash
npm run build
# Deploy to Vercel
npx vercel
```

### **Option 2: Netlify**

```bash
npm run build
npm run export
# Upload dist folder to Netlify
```

### **Option 3: GitHub Pages**

```bash
# Use the cross-site config
cp next.config.cross-site.js next.config.js
npm run build
npm run export
# Deploy dist folder to gh-pages
```

### **Option 4: Traditional Web Hosting**

```bash
cp next.config.cross-site.js next.config.js
npm run build
npm run export
# Upload out/ folder to your hosting provider
```

## 🔧 Configuration Files

### For Static Export (GitHub Pages, traditional hosting):

```javascript
// next.config.js
module.exports = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};
```

### For Server-Side Hosting (Vercel, Netlify):

```javascript
// next.config.js - Use default config
```

## 🌐 Environment Variables

Create `.env.local` for local development:

```
NEXT_PUBLIC_CONTRACT_ADDRESS=0x4c672F0b9290E3e823a43C3cBf2927Bba8a5e4f1
NEXT_PUBLIC_CHAIN_ID=11155111
```

For production, set these in your hosting platform's environment settings.

## 🛠️ Common Issues & Solutions

### Issue: "window is not defined"

**Solution**: ✅ Fixed with client-side checks and useEffect

### Issue: Hydration mismatch

**Solution**: ✅ Fixed with isClient state and conditional rendering

### Issue: MetaMask not detected on mobile

**Solution**: ✅ Graceful fallback to public RPC for browsing

### Issue: Network switching doesn't work

**Solution**: ✅ Added proper event listeners with cleanup

### Issue: Images not loading

**Solution**: ✅ Added proper image configuration for all sources

## 📱 Mobile Compatibility

The app now works on mobile browsers with these features:

- ✅ Browse campaigns without wallet
- ✅ Responsive design
- ✅ Touch-friendly interface
- ✅ Mobile wallet integration

## 🔒 Security Considerations

- Content Security Policy headers
- XSS protection
- Secure image handling
- HTTPS enforcement for production

## 🧪 Testing Different Environments

1. **Local Development**: `npm run dev`
2. **Production Build**: `npm run build && npm start`
3. **Static Export**: `npm run build && npm run export`
4. **Different Browsers**: Test in Chrome, Firefox, Safari, Edge
5. **Mobile Devices**: Test on iOS Safari, Android Chrome

## 📊 Performance Optimizations

- Code splitting for Web3 libraries
- Dynamic imports for client-only components
- Image optimization
- Bundle size optimization

Your DApp is now ready for cross-platform deployment! 🎉
