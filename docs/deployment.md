# Deployment

## Frontend on Vercel

- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: leave empty
- Environment Variable:

```text
NEXT_PUBLIC_API_URL=https://your-backend-domain
```

Use the backend public URL without a trailing slash.

## Backend on Render or Railway

Deploy the `backend` folder as a Docker web service.

Required environment variables:

```text
SPRING_DATASOURCE_URL=jdbc:postgresql://HOST:PORT/DATABASE
SPRING_DATASOURCE_USERNAME=DATABASE_USER
SPRING_DATASOURCE_PASSWORD=DATABASE_PASSWORD
APP_CORS_ALLOWED_ORIGINS=https://your-vercel-domain.vercel.app,http://localhost:3000
PORT=4000
```

After the backend is live, open:

```text
https://your-backend-domain/api/health
```

It should return `{"status":"UP"}`. Then set that backend domain as `NEXT_PUBLIC_API_URL` in Vercel and redeploy the frontend.
