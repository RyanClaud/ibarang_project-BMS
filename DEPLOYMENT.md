# 🚀 Deployment Guide

## Pushing to GitHub

### First Time Setup

1. **Initialize Git (if not already done)**
   ```bash
   git init
   ```

2. **Add remote repository**
   ```bash
   git remote add origin https://github.com/RyanClaud/ibarangay_project-BMS.git
   ```

3. **Check current status**
   ```bash
   git status
   ```

4. **Add all files**
   ```bash
   git add .
   ```

5. **Commit changes**
   ```bash
   git commit -m "Major UI/UX improvements and feature updates

   - Enhanced landing page with modern design
   - Improved authentication pages (login/register)
   - Redesigned dashboards for all user roles
   - Added configurable document pricing per barangay
   - Enhanced profile management with better UI
   - Improved document request forms with live pricing
   - Better table designs with hover effects
   - Updated settings page with pricing configuration
   - Added smooth animations and gradient designs
   - Improved mobile responsiveness"
   ```

6. **Push to GitHub**
   ```bash
   # For first push
   git push -u origin main
   
   # Or if your branch is named 'master'
   git push -u origin master
   ```

### Subsequent Updates

```bash
# Check status
git status

# Add changes
git add .

# Commit with message
git commit -m "Your commit message here"

# Push to GitHub
git push
```

## Deploying to Vercel

### Option 1: Via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: .next
5. Add Environment Variables:
   - `GEMINI_API_KEY`: Your Google AI API key
6. Click "Deploy"

### Option 2: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

## Deploying to Firebase Hosting

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase Hosting**
   ```bash
   firebase init hosting
   ```
   - Select your Firebase project
   - Set public directory: `out`
   - Configure as single-page app: Yes
   - Set up automatic builds: No

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Export static files**
   ```bash
   npx next export
   ```

6. **Deploy**
   ```bash
   firebase deploy --only hosting
   ```

## Environment Variables

Make sure to set these in your deployment platform:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

## Post-Deployment Checklist

- [ ] Test login functionality
- [ ] Test registration flow
- [ ] Verify Firebase connection
- [ ] Check all user roles work correctly
- [ ] Test document request flow
- [ ] Verify payment processing
- [ ] Test on mobile devices
- [ ] Check all pages load correctly
- [ ] Verify AI features work (if enabled)
- [ ] Test multi-barangay functionality

## Troubleshooting

### Build Errors

If you encounter build errors:

```bash
# Clear cache
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

### Firebase Connection Issues

- Verify Firebase config in `src/firebase/config.ts`
- Check Firestore security rules are deployed
- Ensure Authentication is enabled in Firebase Console

### Environment Variables Not Working

- Make sure `.env.local` is in `.gitignore`
- Set environment variables in your deployment platform
- Restart the development server after adding env vars

## Monitoring

After deployment, monitor:

- Firebase Console for database activity
- Vercel Analytics for performance
- Error logs in deployment platform
- User feedback and bug reports

---

**Need Help?**
- Check the main README.md
- Review Firebase documentation
- Contact DICT MIMAROPA support
