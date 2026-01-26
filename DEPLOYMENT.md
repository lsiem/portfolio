# Deployment Guide

## 🚀 Deployment to Vercel (Recommended)

### Step-by-Step Deployment

1. **Connect Repository to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click **New Project**
   - Import this repository (`lsiem/portfolio`)

2. **Configure Domain**:
   - In Vercel, go to **Settings** → **Domains**
   - Add `lsiem.de`

3. **DNS Settings**:
   - Vercel will provide the necessary DNS settings (usually an A Record pointing to `76.76.21.21` or a CNAME for subdomains).
   - Your current DNS already points to Vercel (`216.198.79.1` is a Vercel IP).

## 🛠 Project Configuration

- **Base URL**: Set to `'/'` in [vite.config.js](vite.config.js) for custom domains.
- **Node Version**: Suggested version `20` or higher.

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
