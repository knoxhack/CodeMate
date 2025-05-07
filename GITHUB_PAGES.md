# Deploying CodeMate to GitHub Pages

This document explains how to deploy the CodeMate Minecraft Mod Development Platform to GitHub Pages.

## Prerequisites

Before deploying to GitHub Pages, make sure you have:

1. A GitHub account
2. A repository for your CodeMate project
3. Basic knowledge of Git and GitHub Actions

## Automated Deployment

This project includes an automated GitHub Actions workflow that handles the deployment process for you.

### Setup Steps

1. **Push your code to GitHub**
   
   Create a repository on GitHub and push your CodeMate project to it.

2. **Set up GitHub Pages**
   
   - Go to your repository settings on GitHub
   - Navigate to the "Pages" section
   - Under "Source", select "GitHub Actions"

3. **Configure Environment Variables (optional)**
   
   If your app requires API keys or other environment variables, add them to your repository:
   
   - Go to repository Settings → Secrets and variables → Actions
   - Click "New repository secret" to add sensitive values like `ANTHROPIC_API_KEY`
   - Click "Variables" tab and "New repository variable" for non-sensitive values like `VITE_API_URL`

4. **Trigger deployment**
   
   The deployment will automatically run when you push to the `main` branch. 
   You can also manually trigger it:
   
   - Go to the "Actions" tab in your repository
   - Select the "Deploy to GitHub Pages" workflow
   - Click "Run workflow"

## Deployment Configuration

The deployment is configured in the `.github/workflows/github-pages-deploy.yml` file. Key features:

- Builds the application using Vite
- Automatically creates SPA routing support files:
  - A 404.html page for handling client-side routing
  - Adds SPA routing script to index.html
  - Creates a .nojekyll file to disable GitHub's Jekyll processing
- Deploys the built files to GitHub Pages

## SPA Routing on GitHub Pages

GitHub Pages doesn't natively support client-side routing used in Single Page Applications. 
This project includes workarounds to handle SPA routing on GitHub Pages:

1. A custom 404.html page that redirects to the main app with the requested path
2. A script in index.html that handles the redirect

These are automatically added during the deployment process.

## Custom Domain (optional)

To use a custom domain with your GitHub Pages deployment:

1. Go to repository Settings → Pages
2. Under "Custom domain", enter your domain name
3. Update DNS records at your domain registrar:
   - For apex domain (example.com): Create A records pointing to GitHub Pages IP addresses
   - For subdomain (www.example.com): Create a CNAME record pointing to yourusername.github.io

## Troubleshooting

If you encounter issues with the deployment:

1. Check the workflow run logs in the "Actions" tab
2. Verify all required environment variables are set
3. Ensure your repository has GitHub Pages enabled
4. Check that the build process completes successfully

For more information, refer to [GitHub Pages documentation](https://docs.github.com/en/pages).