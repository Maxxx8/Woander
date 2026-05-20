# Quick Start Guide - Subdomain Admin Panel

## Overview

Your Woander application now has a subdomain-based admin panel architecture:

- **Main Site**: Public website with user features
- **Admin Panel**: Separate admin interface on subdomain

## Project Structure

```
✅ Created:
- src/admin/              Admin application (pages, components, contexts)
- src/shared/             Shared resources (Supabase, Auth, utilities)
- admin.html              Admin panel entry point
- vite.config.main.ts     Main app build config
- vite.config.admin.ts    Admin panel build config
- SUBDOMAIN_DEPLOYMENT_GUIDE.md  Detailed deployment instructions

✅ Updated:
- src/App.tsx             Cleaned up (removed admin routes)
- package.json            New build scripts
- All import paths        Updated to use shared directory
```

## Development Commands

### Start Main Application
```bash
npm run dev:main
# Access at: http://localhost:5173
```

### Start Admin Panel
```bash
npm run dev:admin
# Access at: http://localhost:3001
```

### Build for Production
```bash
npm run build              # Builds both main and admin
npm run build:main         # Build main site only
npm run build:admin        # Build admin panel only
```

### Preview Production Builds
```bash
npm run preview:main       # Preview main site
npm run preview:admin      # Preview admin panel
```

## Build Outputs

After running `npm run build`:

- **dist/main/**: Main site files (deploy to woander.com)
- **dist/admin/**: Admin panel files (deploy to admin.woander.com)

## Key Features

### Separation of Concerns
- ✅ Independent entry points for main app and admin
- ✅ Shared Supabase client and authentication
- ✅ Separate routing systems
- ✅ Independent builds for optimal performance

### Security
- ✅ Admin routes isolated to subdomain
- ✅ Role-based permissions system
- ✅ Separate authentication flows
- ✅ Database-level Row Level Security (RLS)

### Developer Experience
- ✅ Run both apps simultaneously on different ports
- ✅ Shared TypeScript types and utilities
- ✅ Hot module replacement (HMR) for both apps
- ✅ Independent builds and deploys

## Deployment Options

### Quick Deploy (Netlify - Recommended)

#### Main Site
1. Create new Netlify site
2. Build command: `npm run build:main`
3. Publish directory: `dist/main`
4. Custom domain: `woander.com`

#### Admin Site
1. Create another Netlify site
2. Build command: `npm run build:admin`
3. Publish directory: `dist/admin`
4. Custom subdomain: `admin.woander.com`

See `SUBDOMAIN_DEPLOYMENT_GUIDE.md` for detailed instructions.

## Environment Variables

Both applications use the same environment variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Already configured in `.env` file for local development.

## Admin Access

To create your first admin user, use the helper migration:

```sql
-- Already provided in: supabase/migrations/20251117144350_create_first_admin_helper.sql
-- Follow instructions in that file to create admin user
```

## Testing Locally

1. **Start both applications:**
   ```bash
   # Terminal 1
   npm run dev:main

   # Terminal 2
   npm run dev:admin
   ```

2. **Access applications:**
   - Main site: http://localhost:5173
   - Admin panel: http://localhost:3001

3. **Test admin login:**
   - Navigate to http://localhost:3001/login
   - Use admin credentials from database
   - Verify permissions and features

## Common Tasks

### Adding New Admin Page
1. Create page in `src/admin/pages/`
2. Add route in `src/admin/AdminApp.tsx`
3. Update navigation in admin dashboard

### Adding Shared Utility
1. Create file in `src/shared/`
2. Export from that file
3. Import using `import { X } from '../shared/fileName'`

### Updating Admin Permissions
1. Modify `src/admin/adminPermissions.ts`
2. Update database permissions in migration
3. Add permission checks in admin components

## Troubleshooting

### Build fails with import errors
- Check all import paths point to `shared/` directory
- Verify file exists in shared folder
- Run `npm install` to ensure dependencies are installed

### Admin panel shows blank page
- Check browser console for errors
- Verify `admin.html` exists in dist/admin
- Check redirect rules are configured

### Authentication not working
- Verify environment variables are set
- Check Supabase project allows your domain
- Ensure admin user exists in database

## Next Steps

1. ✅ Review `SUBDOMAIN_DEPLOYMENT_GUIDE.md` for deployment
2. ✅ Set up DNS records for subdomain
3. ✅ Configure hosting platform (Netlify/Vercel)
4. ✅ Create first admin user in database
5. ✅ Test admin panel functionality
6. ✅ Set up continuous deployment

## Support Files

- `SUBDOMAIN_DEPLOYMENT_GUIDE.md`: Comprehensive deployment guide
- `netlify.main.toml`: Netlify config for main site
- `netlify.admin.toml`: Netlify config for admin site
- `vercel.main.json`: Vercel config for main site
- `vercel.admin.json`: Vercel config for admin site

## Architecture Benefits

✅ **Security**: Admin isolated on separate subdomain
✅ **Performance**: Independent builds and caching
✅ **Scalability**: Can deploy to different servers
✅ **Maintainability**: Clear separation of concerns
✅ **Flexibility**: Update admin without affecting main site

---

**Ready to deploy?** Read `SUBDOMAIN_DEPLOYMENT_GUIDE.md` for step-by-step instructions.
