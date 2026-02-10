# Deployment Checklist

This document provides a step-by-step guide for deploying the Gladex Requisition Management System to GitHub and production.

## Pre-Deployment Checklist

### ✅ Security

- [x] Firebase API keys moved to environment variables
- [x] `.env.local` added to `.gitignore`
- [x] `.env.example` created with placeholder values
- [x] No hardcoded secrets in source code
- [ ] Firebase Security Rules applied and tested
- [ ] MD Access Code changed from default

### ✅ Code Quality

- [x] All TypeScript errors resolved
- [x] No console errors in browser
- [x] All features tested and working
- [x] PDF generation working correctly
- [x] Signature persistence working

### ✅ Documentation

- [x] README.md created with setup instructions
- [x] Environment variables documented
- [x] Firebase setup instructions included
- [x] Security rules documented

## GitHub Deployment Steps

### 1. Initialize Git (if not already done)

```bash
git init
git add .
git commit -m "Initial commit: Gladex Requisition Management System"
```

### 2. Create GitHub Repository

1. Go to [GitHub](https://github.com)
2. Click "New Repository"
3. Name: `gladexrequsition`
4. Description: "Material Requisition Management System for Gladex Dynamic Resources Limited"
5. Choose: Private (recommended) or Public
6. Do NOT initialize with README (we already have one)
7. Click "Create Repository"

### 3. Connect Local Repository to GitHub

```bash
git remote add origin https://github.com/yourusername/gladexrequsition.git
git branch -M main
git push -u origin main
```

### 4. Verify Deployment

1. Go to your GitHub repository
2. Verify all files are present
3. Check that `.env.local` is NOT in the repository
4. Verify `.env.example` IS in the repository
5. Check README.md displays correctly

## Production Deployment (Vercel)

### 1. Connect to Vercel

1. Go to [Vercel](https://vercel.com)
2. Click "Import Project"
3. Select your GitHub repository
4. Click "Import"

### 2. Configure Environment Variables

In Vercel dashboard:

1. Go to Project Settings → Environment Variables
2. Add all variables from `.env.local`:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
   - `NEXT_PUBLIC_MD_ACCESS_CODE`

3. Set environment: Production, Preview, Development (all)
4. Click "Save"

### 3. Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Visit your production URL

### 4. Post-Deployment Verification

- [ ] Application loads without errors
- [ ] Firebase connection working
- [ ] Authentication working
- [ ] Can create requisitions
- [ ] Can approve requisitions
- [ ] PDF download working
- [ ] Signatures persisting
- [ ] All dashboards accessible

## Firebase Security Rules

### Apply Security Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Firestore Database → Rules
4. Copy the rules from README.md
5. Click "Publish"

### Test Security Rules

Test that:
- [ ] Unauthenticated users cannot access data
- [ ] Staff can only see their own requisitions
- [ ] Procurement can approve at procurement stage
- [ ] Accounts can approve at account stage
- [ ] MD can approve at any stage
- [ ] Only MD can delete requisitions
- [ ] Activity logs cannot be modified

## Environment-Specific Configuration

### Development

```bash
# Use .env.local
pnpm dev
```

### Production

```bash
# Environment variables set in Vercel/hosting platform
pnpm build
pnpm start
```

## Rollback Procedure

If deployment fails:

1. Check Vercel deployment logs
2. Verify environment variables are set correctly
3. Check Firebase connection
4. Roll back to previous deployment in Vercel
5. Fix issues locally
6. Redeploy

## Monitoring

### What to Monitor

- [ ] Firebase usage (reads/writes)
- [ ] Authentication errors
- [ ] Application errors in Vercel logs
- [ ] User feedback
- [ ] PDF generation success rate

### Firebase Quotas

Free tier limits:
- 50,000 reads/day
- 20,000 writes/day
- 20,000 deletes/day
- 1 GB storage

Monitor usage in Firebase Console → Usage tab

## Security Best Practices

### Production Checklist

- [ ] Change MD Access Code from default
- [ ] Enable Firebase App Check (optional but recommended)
- [ ] Set up Firebase Security Rules
- [ ] Enable 2FA for Firebase Console access
- [ ] Regularly review Firebase audit logs
- [ ] Keep dependencies updated
- [ ] Monitor for security vulnerabilities

### Regular Maintenance

- [ ] Weekly: Check Firebase usage
- [ ] Monthly: Review security rules
- [ ] Quarterly: Update dependencies
- [ ] Annually: Security audit

## Support

For deployment issues:
1. Check Vercel deployment logs
2. Check Firebase Console for errors
3. Review this checklist
4. Contact development team

## Notes

- Always test in development before deploying to production
- Keep `.env.local` secure and never commit it
- Regularly backup Firebase data
- Monitor Firebase costs as usage grows
- Update README.md when making changes
