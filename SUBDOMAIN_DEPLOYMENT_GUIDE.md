# Subdomain-Based Admin Panel Deployment Guide

This guide explains how to deploy the Woander application with a subdomain-based admin panel.

## Architecture Overview

The application is now split into two separate builds:

1. **Main Application** (`dist/main`): Public-facing website at `woander.com`
2. **Admin Panel** (`dist/admin`): Admin interface at `admin.woander.com`

Both applications share common resources (Supabase client, auth contexts) from the `src/shared` directory.

## Project Structure

```
project/
├── src/
│   ├── admin/              # Admin application
│   │   ├── main.tsx        # Admin entry point
│   │   ├── AdminApp.tsx    # Admin root component
│   │   ├── pages/          # Admin pages
│   │   ├── components/     # Admin-specific components
│   │   ├── contexts/       # Admin contexts
│   │   └── adminPermissions.ts
│   ├── shared/             # Shared resources
│   │   ├── supabase.ts     # Supabase client
│   │   ├── AuthContext.tsx # User auth context
│   │   └── subdomainUtils.ts # Subdomain detection
│   ├── components/         # Main app components
│   ├── pages/              # Main app pages
│   └── App.tsx             # Main app root
├── admin.html              # Admin panel HTML entry
├── index.html              # Main app HTML entry
├── vite.config.main.ts     # Main app build config
└── vite.config.admin.ts    # Admin panel build config
```

## Development

### Running Locally

#### Main Application
\`\`\`bash
npm run dev:main
# Access at: http://localhost:5173
\`\`\`

#### Admin Panel
\`\`\`bash
npm run dev:admin
# Access at: http://localhost:3001
\`\`\`

#### Both Applications (in separate terminals)
\`\`\`bash
npm run dev:main
npm run dev:admin
\`\`\`

### Building for Production

Build both applications:
\`\`\`bash
npm run build
\`\`\`

Build individually:
\`\`\`bash
npm run build:main   # Output: dist/main
npm run build:admin  # Output: dist/admin
\`\`\`

## Deployment Options

### Option 1: Netlify (Recommended)

#### Setup

1. Create two separate Netlify sites:
   - Main site: `woander.com`
   - Admin site: `admin.woander.com`

#### Main Site Configuration

Create `netlify.main.toml`:
\`\`\`toml
[build]
  command = "npm run build:main"
  publish = "dist/main"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "20"
\`\`\`

#### Admin Site Configuration

Create `netlify.admin.toml`:
\`\`\`toml
[build]
  command = "npm run build:admin"
  publish = "dist/admin"

[[redirects]]
  from = "/*"
  to = "/admin.html"
  status = 200

[build.environment]
  NODE_VERSION = "20"
\`\`\`

#### Deployment Steps

1. **Deploy Main Site:**
   - Connect repository to Netlify
   - Set build command: `npm run build:main`
   - Set publish directory: `dist/main`
   - Add custom domain: `woander.com`
   - Add environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)

2. **Deploy Admin Site:**
   - Create new Netlify site from same repository
   - Set build command: `npm run build:admin`
   - Set publish directory: `dist/admin`
   - Add custom subdomain: `admin.woander.com`
   - Add same environment variables

### Option 2: Vercel

#### Main Site Configuration

Create `vercel.main.json`:
\`\`\`json
{
  "buildCommand": "npm run build:main",
  "outputDirectory": "dist/main",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
\`\`\`

#### Admin Site Configuration

Create `vercel.admin.json`:
\`\`\`json
{
  "buildCommand": "npm run build:admin",
  "outputDirectory": "dist/admin",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/admin.html"
    }
  ]
}
\`\`\`

#### Deployment Steps

1. Deploy main site with custom domain
2. Deploy admin as separate project with subdomain

### Option 3: Traditional Hosting (Nginx/Apache)

#### Nginx Configuration

\`\`\`nginx
# Main site
server {
    listen 80;
    server_name woander.com;
    root /var/www/woander/main;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

# Admin subdomain
server {
    listen 80;
    server_name admin.woander.com;
    root /var/www/woander/admin;
    index admin.html;

    location / {
        try_files $uri $uri/ /admin.html;
    }
}
\`\`\`

#### Deployment Steps

1. Build both applications: `npm run build`
2. Upload `dist/main/*` to `/var/www/woander/main/`
3. Upload `dist/admin/*` to `/var/www/woander/admin/`
4. Configure DNS for subdomain
5. Set up SSL certificates

## DNS Configuration

Add these DNS records to your domain:

\`\`\`
Type    Name    Value
A       @       [Your server IP]
A       admin   [Your server IP]
\`\`\`

Or if using CNAME:

\`\`\`
Type    Name    Value
CNAME   admin   your-admin-site.netlify.app
\`\`\`

## Environment Variables

Both applications need these environment variables:

\`\`\`env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

Set them in:
- Netlify: Site settings > Environment variables
- Vercel: Project settings > Environment variables
- Local: `.env` file (already configured)

## Security Considerations

1. **Admin Access:**
   - Admin panel is on separate subdomain for isolation
   - Requires authentication through Supabase
   - Role-based permissions enforced at database level

2. **CORS Configuration:**
   - Supabase automatically handles CORS for your domains
   - No additional CORS configuration needed

3. **Session Management:**
   - Sessions are domain-scoped
   - Admin sessions are separate from user sessions

4. **SSL/TLS:**
   - Always use HTTPS in production
   - Most platforms (Netlify, Vercel) provide free SSL

## Testing the Deployment

### Main Site
1. Visit `https://woander.com`
2. Test user registration and login
3. Verify all public features work

### Admin Panel
1. Visit `https://admin.woander.com`
2. Login with admin credentials
3. Test content moderation features
4. Verify permissions are working

## Troubleshooting

### Admin Panel Not Loading
- Check DNS records for `admin` subdomain
- Verify build output in `dist/admin`
- Check redirect rules are in place

### Authentication Issues
- Verify environment variables are set correctly
- Check Supabase project settings allow your domains
- Ensure cookies are not blocked by browser

### Build Failures
- Run `npm install` to ensure dependencies are installed
- Check Node.js version is 18 or higher
- Try building main and admin separately to isolate issues

## Continuous Deployment

### GitHub Actions Example

\`\`\`yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-main:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build:main
      - uses: netlify/actions/cli@master
        with:
          args: deploy --prod --dir=dist/main
        env:
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_MAIN_SITE_ID }}
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}

  deploy-admin:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build:admin
      - uses: netlify/actions/cli@master
        with:
          args: deploy --prod --dir=dist/admin
        env:
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_ADMIN_SITE_ID }}
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
\`\`\`

## Monitoring

Monitor both sites separately:
- Set up uptime monitoring (Pingdom, UptimeRobot)
- Configure error tracking (Sentry)
- Monitor build times and failures
- Track admin activity through Supabase logs

## Backup and Rollback

1. Keep previous builds for quick rollback
2. Use Netlify/Vercel's deployment history
3. Maintain database backups through Supabase
4. Document rollback procedures

## Support

For issues or questions:
1. Check this guide first
2. Review Supabase documentation
3. Check hosting platform documentation
4. Contact development team
