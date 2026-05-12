# Deployment Guide - Office Time Tracker

Complete step-by-step guide to deploy your Chrome Extension to production.

## Pre-Deployment Checklist

### 1. Code Quality
- [ ] All features tested locally
- [ ] No console errors or warnings
- [ ] TypeScript compiles without errors
- [ ] All imports are correct
- [ ] No hardcoded values (use settings)

### 2. Assets
- [ ] Icon created (128x128 PNG minimum)
- [ ] Icons in `assets/` folder:
  - [ ] `icon-16.png` (16x16)
  - [ ] `icon-32.png` (32x32)
  - [ ] `icon-48.png` (48x48)
  - [ ] `icon-128.png` (128x128)
- [ ] Screenshot prepared (1280x800)
- [ ] Privacy policy written

### 3. Documentation
- [ ] README is complete
- [ ] version updated in `package.json` and `plasmo.json`
- [ ] Changelog updated

### 4. Manifest & Configuration
- [ ] `manifest.json` has correct permissions
- [ ] `plasmo.json` is configured correctly
- [ ] Service worker is included
- [ ] All popup routes work

## Build Process

### Step 1: Prepare Build

```bash
# Install fresh dependencies
npm ci

# Run lint/type check (if you add eslint)
# npm run lint
# npm run type-check

# Build for production
npm run build
```

### Step 2: Create Distribution ZIP

```bash
# Create ZIP file for Chrome Web Store
npm run build:zip
```

This creates `build.zip` containing all extension files.

### Step 3: Verify Build

```bash
# In Chrome, test the build:
# 1. Open chrome://extensions/
# 2. Enable Developer mode
# 3. Load unpacked -> select build/ folder
# 4. Test all features
# 5. Check Service Worker logs for errors
```

## Chrome Web Store Submission

### Step 1: Create Developer Account

1. Go to [Chrome Web Store Developer Console](https://chrome.google.com/webstore/devconsole)
2. Sign in with Google account
3. Accept terms and conditions
4. Pay one-time $5 registration fee

### Step 2: Create New Item

1. Click "Create new item"
2. Select **ZIP file** containing `build.zip`
3. Upload the file
4. Extension is created with auto-generated ID

### Step 3: Fill Extension Information

In the Developer Console, fill these sections:

#### Product Details

| Field | Value |
|-------|-------|
| **Name** | Office Time Tracker |
| **Category** | Productivity |
| **Listing language** | English |

#### Detailed Description

```
Professional office time tracking extension for Chrome.

Features:
• Clock in/out with precise timestamps
• Break management (45-minute default)
• Real-time worked hours calculation
• Late arrival and overtime tracking
• Weekly and monthly analytics with charts
• CSV export for all your time data
• Dark mode for comfortable use
• Idle activity detection
• Smart notifications and reminders
• All data stored locally in Chrome (no cloud required)

Perfect for:
✓ Remote workers tracking office hours
✓ Hourly workers documenting time
✓ Freelancers managing work sessions
✓ Anyone wanting to understand their work patterns

Privacy: All data is stored locally on your device. No information is sent to external servers.

Permissions explained:
• Storage: To save your time entries locally
• Alarms: To send you reminders at set times
• Notifications: To notify you of important time events

Open source and regularly updated!
```

#### Short Description (Max 132 chars)
```
Track office hours, manage breaks, view analytics. All data stored locally.
```

#### Developer Information

| Field | Value |
|-------|-------|
| **Developer name** | [Your Name] |
| **Developer email** | [Your Email] |
| **Support email** | [Your Email] |
| **Privacy policy URL** | [See below] |
| **Support page URL** | (optional) |

#### Create Privacy Policy

Create a file `PRIVACY.md`:

```markdown
# Privacy Policy

**Office Time Tracker** respects your privacy.

## Data Storage
All time tracking data is stored locally on your computer using Chrome's built-in storage API. No data is:
- Sent to external servers
- Stored in the cloud
- Shared with third parties
- Used for tracking or analytics

## Permissions
The extension requests these Chrome permissions:

### Storage
Used to save your daily time entries locally on your device.

### Alarms
Used to schedule reminder notifications for clock-in/out times.

### Notifications
Used to display desktop notifications for time tracking events (clock-in, clock-out, break reminders).

### Host Permissions
These are included in the manifest but not actively used by default.

## No Tracking
This extension does not:
- Track your browsing activity
- Collect personal information beyond what you enter
- Use analytics or telemetry
- Contact external services

## Changes
If we make changes to this policy, we will update the extension description on the Chrome Web Store.

Last updated: [Today's Date]
```

Host the privacy policy on a public website (GitHub Pages, personal site, etc.) and put the URL in the Developer Console.

### Step 4: Upload Screenshots & Images

#### Screenshots
1. Go to "Screenshots" section
2. Upload 2-3 screenshots (1280x800):
   - **Screenshot 1**: Main timer interface showing clock in/out
   - **Screenshot 2**: Dashboard with weekly charts
   - **Screenshot 3**: Settings page with dark mode

#### Icon
1. Go to "Branding" or "Assets" section
2. Upload:
   - **Icon**: 128x128 PNG (must be square, no transparency needed for Web Store)
   - **Hero image** (optional): 1400x560 for Web Store header

### Step 5: Content Rating

1. Go to "Content ratings" section
2. Fill out a brief questionnaire (takes ~2 minutes)
3. Google assigns an ESRB rating (will be "Everyone")

### Step 6: Submission

1. Review all information one final time
2. Click "Submit for review"
3. Google reviews the extension (usually 24-48 hours)
4. You receive email when approved or if changes needed

## After Approval

### Initial Release
Once approved, your extension is live on Chrome Web Store!

### Monitor Performance
1. Check the Developer Console dashboard:
   - Installation trends
   - Crash reports
   - User reviews
   - Traffic sources

### Handle Feedback
- Respond to user reviews
- Fix reported bugs quickly
- Plan major features for future versions

## Updating Your Extension

When you want to release a new version:

### 1. Update Version Numbers
```json
// package.json
{
  "version": "1.1.0"
}

// plasmo.json
{
  "manifest": {
    "version": "1.1.0"
  }
}
```

### 2. Update CHANGELOG
```markdown
## v1.1.0 (2024-06-01)
- Fixed idle detection bug
- Added keyboard shortcuts
- Improved dark mode colors
```

### 3. Build and Upload
```bash
npm run build
npm run build:zip
```

### 4. Submit Update
In Developer Console:
1. Click "Edit"
2. Upload new `build.zip`
3. Update description if needed
4. Click "Submit for review"

New version goes through expedited review (usually 24 hours).

## Distribution Methods

### Option 1: Chrome Web Store (Recommended)
- ✅ Official distribution
- ✅ Auto-updates for users
- ✅ Discoverable in search
- ❌ Review process (24-48 hours)
- ❌ Cannot use custom icons initially

### Option 2: Direct Installation (Testing)
Perfect for beta testing:

```bash
# Create build
npm run build

# Share the build/ folder or create build.zip
# Users can:
# 1. Download ZIP
# 2. Extract to folder
# 3. Go to chrome://extensions/
# 4. Enable Developer mode
# 5. Click "Load unpacked"
# 6. Select the folder
```

### Option 3: Enterprise Deployment
For internal company use:

```bash
# Create CRX file (signed extension)
npm run build

# Use Chrome Enterprise Policy to push extension:
# https://support.google.com/chrome/a/answer/7559895
```

## Troubleshooting Deployment

### Extension Rejected
Common rejection reasons:
- [ ] Manifest v3 not used (update `plasmo.json`)
- [ ] Unclear privacy policy
- [ ] Misleading descriptions
- [ ] Contains malware (unlikely if building from this code)

**Solution**: Check rejection email, fix issues, resubmit.

### Build Errors
```bash
# Clear cache and rebuild
rm -rf build dist node_modules
npm install
npm run build
```

### ZIP File Issues
```bash
# Ensure ZIP contains correct structure
# Should have: manifest.json at root level
# Check: unzip -l build.zip | head
```

## Performance Optimization Before Release

### 1. Bundle Size
```bash
# Check bundle size
npm run build

# Should be ~150KB uncompressed, ~45KB gzipped
```

### 2. Load Time
- Extension should load popup in <500ms
- Service worker should initialize in <1s

### 3. Memory Usage
- Popup: <30MB RAM
- Service Worker: <10MB RAM

## Security Checklist

- [ ] No API keys or secrets in code
- [ ] All external URLs are HTTPS
- [ ] No eval() or Function() calls
- [ ] XSS protection (React handles this)
- [ ] CSRF tokens if needed (not needed for local-only)
- [ ] Input validation (for future expansions)

## Monitor After Release

### Week 1
- Check for crash reports
- Read user reviews
- Monitor installation count
- Test on different Chrome versions

### Month 1
- Respond to all reviews
- Fix critical bugs
- Plan next features based on feedback

### Ongoing
- Keep dependencies updated
- Monitor Chrome API changes
- Add new features requested by users
- Maintain high review rating (target: 4.5+)

## Example Metrics to Track

```
Day 1: 10 installs
Week 1: 50 installs
Month 1: 200 installs
Month 3: 500 installs
Month 6: 1000+ installs
```

These are realistic numbers for a niche productivity extension.

## Future Enhancements

Consider for v2.0:
- [ ] Sync across devices (requires backend)
- [ ] Cloud backup
- [ ] Team/manager view
- [ ] Integration with Slack/Teams
- [ ] Mobile app companion
- [ ] Advanced analytics
- [ ] Custom reports

---

**Congratulations! You're ready to deploy your Office Time Tracker extension to the world!** 🎉

For questions about Chrome Web Store submission, see:
- [Chrome Web Store Developer Documentation](https://developer.chrome.com/docs/webstore/)
- [Manifest v3 Migration Guide](https://developer.chrome.com/docs/extensions/mv3/migration/)
- [Content Security Policy](https://developer.chrome.com/docs/extensions/mv3/content_security_policy/)
