# Woander - Subdomain-Based Admin Panel

## 🎯 Overview

Woander now features a professional subdomain-based architecture that separates the admin panel from the main public website. This provides enhanced security, better performance, and cleaner code organization.

## 📁 Architecture

```
woander.com           → Main public website
admin.woander.com     → Admin management panel
```

Both applications share common resources (database, authentication) but run independently.

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install --production=false

# Run main site (localhost:5173)
npm run dev:main

# Run admin panel (localhost:3001)
npm run dev:admin

# Build both for production
npm run build
```

### Production Build

```bash
npm run build              # Builds both applications
npm run build:main         # Build main site → dist/main/
npm run build:admin        # Build admin panel → dist/admin/
```

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **QUICK_START.md** | Quick reference for common tasks |
| **SUBDOMAIN_DEPLOYMENT_GUIDE.md** | Comprehensive deployment instructions |
| **SUBDOMAIN_IMPLEMENTATION_SUMMARY.md** | Technical implementation details |

## 🏗️ Project Structure

```
src/
├── admin/              # Admin application
│   ├── main.tsx        # Admin entry point
│   ├── AdminApp.tsx    # Admin root component
│   ├── pages/          # Admin pages
│   ├── components/     # Admin components
│   ├── contexts/       # Admin contexts
│   └── adminPermissions.ts
│
├── shared/             # Shared resources
│   ├── supabase.ts     # Supabase client
│   ├── AuthContext.tsx # User authentication
│   └── subdomainUtils.ts
│
├── components/         # Main app components
├── pages/             # Main app pages
├── services/          # API services
└── App.tsx            # Main app root
```

## 🔑 Key Features

### ✅ Security
- Admin panel isolated on separate subdomain
- Role-based permission system
- Database-level Row Level Security (RLS)
- Separate authentication flows

### ✅ Performance
- Independent builds reduce bundle sizes
- Main site: ~393 KB (gzipped: 93 KB)
- Admin panel: ~238 KB (gzipped: 59 KB)
- Faster load times for regular users

### ✅ Developer Experience
- Work on admin without affecting main site
- Hot module replacement for both apps
- Clear code organization
- Shared TypeScript types

### ✅ Deployment Flexibility
- Deploy independently
- Use different hosting platforms
- Separate caching strategies
- Easy rollback per application

## 🌐 Deployment

### Netlify (Recommended)

#### Main Site
```bash
# Use: netlify.main.toml
Build command: npm run build:main
Publish directory: dist/main
Domain: woander.com
```

#### Admin Panel
```bash
# Use: netlify.admin.toml
Build command: npm run build:admin
Publish directory: dist/admin
Domain: admin.woander.com
```

### Vercel

#### Main Site
```bash
# Use: vercel.main.json
Build command: npm run build:main
Output directory: dist/main
```

#### Admin Panel
```bash
# Use: vercel.admin.json
Build command: npm run build:admin
Output directory: dist/admin
```

See `SUBDOMAIN_DEPLOYMENT_GUIDE.md` for detailed instructions.

## 🔐 Admin Access

### Creating First Admin User

Run the SQL migration:
```sql
-- File: supabase/migrations/20251117144350_create_first_admin_helper.sql
-- Follow instructions in that file
```

### Admin Roles

- **Super Admin**: Full system access
- **Moderator**: Content management
- **Support**: View-only access

## 🛠️ Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Run main app (default) |
| `npm run dev:main` | Run main app on port 5173 |
| `npm run dev:admin` | Run admin panel on port 3001 |
| `npm run build` | Build both applications |
| `npm run build:main` | Build main site only |
| `npm run build:admin` | Build admin panel only |
| `npm run preview:main` | Preview main build |
| `npm run preview:admin` | Preview admin build |

## 🌍 Environment Variables

Both applications use:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Set these in:
- Local: `.env` file (already configured)
- Netlify: Site settings → Environment variables
- Vercel: Project settings → Environment variables

## 📋 DNS Configuration

Add these records to your domain:

```
Type    Name    Value
A       @       [Your server IP or hosting]
CNAME   admin   [Your admin hosting URL]
```

Or for Netlify/Vercel:
```
CNAME   admin   your-admin-site.netlify.app
```

## 🧪 Testing

### Local Testing
```bash
# Terminal 1
npm run dev:main

# Terminal 2  
npm run dev:admin

# Access:
# Main: http://localhost:5173
# Admin: http://localhost:3001/login
```

### Build Testing
```bash
npm run build
npm run preview:main
npm run preview:admin
```

## 📊 Build Outputs

After `npm run build`:

```
dist/
├── main/
│   ├── index.html
│   ├── assets/
│   └── ...
└── admin/
    ├── admin.html
    ├── assets/
    └── ...
```

## 🔍 Troubleshooting

### Build fails
```bash
rm -rf node_modules
npm install --production=false
npm run build
```

### Admin panel blank
- Check `dist/admin/admin.html` exists
- Verify redirect rules configured
- Check browser console for errors

### Auth issues
- Verify environment variables
- Check Supabase allows your domain
- Ensure admin user exists in database

## 📖 Further Reading

1. **Getting Started**: Read `QUICK_START.md`
2. **Deployment**: Read `SUBDOMAIN_DEPLOYMENT_GUIDE.md`
3. **Technical Details**: Read `SUBDOMAIN_IMPLEMENTATION_SUMMARY.md`

## 🎉 Success Checklist

- [x] Separate admin and main applications created
- [x] Independent build configurations set up
- [x] Shared resources properly organized
- [x] Build scripts configured
- [x] Deployment configs created (Netlify, Vercel)
- [x] Documentation completed
- [x] Both builds verified successfully

## 💪 Next Steps

1. Review documentation files
2. Test both applications locally
3. Choose deployment platform
4. Configure DNS for subdomain
5. Deploy main site
6. Deploy admin panel
7. Create first admin user
8. Test in production

---

**Need Help?** Check the documentation files or review the implementation summary for technical details.
