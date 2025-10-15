# Deployment Guide

## 🚀 Quick Deploy to GitHub Pages

### Prerequisites

- GitHub account
- Repository created on GitHub
- Code committed to local repository

### Step-by-Step Deployment

#### 1. Prepare Your Repository

Ensure you have committed all changes:

```bash
git add .
git commit -m "Prepare for deployment"
```

#### 2. Configure for GitHub Pages

If deploying to `username.github.io/portfolio` (repository name is not your username):

Update `vite.config.js`:

```javascript
export default defineConfig({
  base: '/portfolio/', // Replace with your repo name
  plugins: [react(), tailwindcss()],
})
```

If deploying to custom domain or `username.github.io`:

Keep `base: '/'` in `vite.config.js`.

#### 3. Push to GitHub

```bash
git remote add origin https://github.com/lsiem/portfolio.git
git branch -M main
git push -u origin main
```

#### 4. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**
4. The deployment will start automatically

#### 5. Wait for Deployment

- GitHub Actions will build and deploy your site
- Check the **Actions** tab to monitor progress
- Usually takes 2-5 minutes

#### 6. Access Your Site

- **GitHub subdomain**: `https://lsiem.github.io/portfolio/`
- **Custom domain**: Configure in repository settings

## 🌐 Custom Domain Setup

### Add CNAME Record

The `public/CNAME` file is already configured with `lsiem.de`.

### Configure DNS

In your domain registrar (e.g., Namecheap, GoDaddy):

1. Add an **A record**:
   - Host: `@`
   - Value: GitHub Pages IPs:
     - `185.199.108.153`
     - `185.199.109.153`
     - `185.199.110.153`
     - `185.199.111.153`

2. Add a **CNAME record** (for www):
   - Host: `www`
   - Value: `lsiem.github.io`

### Enable HTTPS in GitHub

1. Go to repository **Settings** → **Pages**
2. Check **Enforce HTTPS**
3. Wait for SSL certificate provisioning (up to 24 hours)

## 🔄 Updating Your Site

After the initial deployment, updates are automatic:

```bash
git add .
git commit -m "Update content"
git push
```

GitHub Actions will automatically rebuild and redeploy.

## 🛠️ Troubleshooting

### Build Fails

- Check the **Actions** tab for error logs
- Ensure all dependencies are in `package.json`
- Test locally with `npm run build`

### 404 Errors

- Verify `base` in `vite.config.js` matches your deployment
- For GitHub Pages subdirectory: use `/repo-name/`
- For custom domain: use `/`

### Custom Domain Not Working

- Check DNS propagation: [dnschecker.org](https://dnschecker.org)
- Verify CNAME file exists in `public/` directory
- Wait up to 24-48 hours for full propagation

### Styles Not Loading

- Clear browser cache
- Check that `base` path is correct
- Inspect browser console for 404 errors

## 📞 Need Help?

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- Open an issue in this repository

---

Happy deploying! 🎉
