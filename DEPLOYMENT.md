# Deployment Guide

## GitHub Pages Configuration

This portfolio site is configured to deploy to GitHub Pages using GitHub Actions and the artifact-based deployment method.

### Current Setup

The `.github/workflows/deploy.yml` workflow:
1. Builds the TypeScript code (`src/index.ts` → `dist/index.js`)
2. Copies static files (`index.html` and `styles.css`) to the `dist` directory
3. Uploads the `dist` directory as a Pages artifact
4. Deploys the artifact to GitHub Pages

### Ensuring Proper Configuration

To avoid conflicts with legacy deployment methods, ensure your repository's GitHub Pages settings are configured correctly:

1. Go to **Settings** → **Pages** in your GitHub repository
2. Under "Build and deployment", set **Source** to **GitHub Actions**
3. Do NOT use "Deploy from a branch" - this would create a redundant deployment method

### Why This Matters

If "Deploy from a branch" is enabled alongside the GitHub Actions workflow, you'll have TWO publishing workflows:
- ❌ **Legacy**: Deploy from branch (e.g., `main` or `gh-pages`) - **REMOVE THIS**
- ✅ **Modern**: Deploy via GitHub Actions artifact (current setup) - **KEEP THIS**

The artifact-based deployment (current setup) is the recommended approach as it:
- Allows pre-processing of files (TypeScript compilation, minification, etc.)
- Provides better control over what gets deployed
- Supports more complex build pipelines

### Files Deployed

The following files are deployed to GitHub Pages from the `dist/` directory:
- `index.html` - Main portfolio page
- `index.js` - Compiled JavaScript from TypeScript
- `styles.css` - Stylesheet

All paths in `index.html` use relative references (`./styles.css`, `./index.js`) to ensure compatibility with GitHub Pages project sites.
