# Media Assets

This directory contains screenshots, videos, and other media assets for the MediVet platform documentation.

## Required Media Files

### Videos (GIF format recommended)
- `platform-demo.gif` - Complete platform walkthrough
- `upload-ai-flow.gif` - File upload to AI analysis flow
- `provider-collaboration.gif` - Provider requesting patient data
- `cross-platform-sync.gif` - Data sync between web and mobile

### Screenshots (PNG format recommended)

#### Web Application
- `web-patient-dashboard.png` - Patient dashboard overview
- `web-provider-dashboard.png` - Provider dashboard interface
- `web-ai-analysis.png` - AI analysis results display

#### Mobile Application
- `android-health-data.png` - Health Connect integration
- `android-upload.png` - Mobile file upload interface

## Guidelines

### Video Requirements
- Format: GIF or MP4
- Max size: 10MB per file
- Resolution: 1920x1080 or 1280x720
- Duration: 30-60 seconds max

### Screenshot Requirements
- Format: PNG with transparency support
- Resolution: High DPI (2x) preferred
- Consistent UI state (no loading spinners)
- Clean, professional appearance

### File Naming
- Use kebab-case for filenames
- Include platform prefix (web-, android-, server-)
- Be descriptive but concise

## Usage in Documentation

All media files are referenced in the main README.md using relative paths:

```markdown
![Description](./docs/media/filename.png)
```

## Git LFS Recommendation

For large media files (>1MB), consider using Git LFS:

```bash
git lfs track "docs/media/*.gif"
git lfs track "docs/media/*.mp4"
```
