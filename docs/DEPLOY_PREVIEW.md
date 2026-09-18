# Deploy preview: Vercel frontend + Railway backend/PostgreSQL

This guide is for a temporary public test deploy. After every GitHub push, Vercel/Railway can redeploy automatically.

## 1. Push code to GitHub

Create a GitHub repository and push this `van-moc` folder.

## 2. Railway: create PostgreSQL

1. Open Railway.
2. Create a new project.
3. Add PostgreSQL.
4. Keep the database private. The backend service in the same Railway project can use Railway private variables.

Railway will provide variables like:

```text
PGHOST
PGPORT
PGDATABASE
PGUSER
PGPASSWORD
DATABASE_URL
```

## 3. Railway: deploy backend

Create a new service from the same GitHub repo.

Recommended Railway settings:

```text
Root Directory: backend
Builder: Dockerfile
Dockerfile Path: Dockerfile
Healthcheck Path: /api/health
```

Add backend variables in Railway:

```env
PORT=4000
SPRING_DATASOURCE_URL=jdbc:postgresql://${PGHOST}:${PGPORT}/${PGDATABASE}
SPRING_DATASOURCE_USERNAME=${PGUSER}
SPRING_DATASOURCE_PASSWORD=${PGPASSWORD}
APP_CORS_ALLOWED_ORIGINS=https://*.vercel.app,http://localhost:3000
GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
```

After deployment, copy the backend public URL, for example:

```text
https://van-moc-backend-production.up.railway.app
```

Test:

```text
https://your-backend-url/api/health
```

## 4. Vercel: deploy frontend

Import the same GitHub repo in Vercel.

Vercel settings:

```text
Root Directory: frontend
Framework: Next.js
Build Command: npm run build
Install Command: npm install
```

Add frontend variables in Vercel:

```env
NEXT_PUBLIC_API_URL=https://your-railway-backend.up.railway.app
NEXT_PUBLIC_SITE_URL=https://your-vercel-preview.vercel.app
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset
NEXT_PUBLIC_MESSENGER_URL=https://m.me/your_facebook_page
NEXT_PUBLIC_MESSENGER_PAGE_NAME=Van Moc
NEXT_PUBLIC_SUPPORT_EMAIL=support@vanmoc.vn
```

Deploy. Vercel will give a URL like:

```text
https://van-moc.vercel.app
```

## 5. Update backend CORS

After Vercel gives you the final preview URL, update Railway backend:

```env
APP_CORS_ALLOWED_ORIGINS=https://*.vercel.app,https://your-vercel-preview.vercel.app,http://localhost:3000
```

Redeploy/restart backend.

## 6. Test checklist

Open the Vercel URL and test:

- Home page loads.
- Product list loads from backend.
- Product detail page opens.
- Add to cart works.
- Checkout creates an order.
- `/trace/VM000123` loads Product Passport data.
- Admin login works.
- Admin product/category/banner/content management works.

Seed admin account:

```text
Email: mocvan2026@gmail.com
Password: admin123
```

Seed staff account:

```text
Email: staff+mocvan2026@gmail.com
Password: staff123
```

## 7. How to update after fixing code

```text
edit code -> git add/commit -> git push
```

Vercel and Railway will redeploy from GitHub.
