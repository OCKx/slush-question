# The Slush Question

Independent, minimalist Slush 2026 directory. **Not affiliated with or endorsed by Slush.**

## Features
- Centered homepage question and navigation (React Router SPA)
- Published investor answers, startup summaries, and builder projects
- Client-side search, category filters, LinkedIn links
- Private admin sign-in, drafts, create/edit/delete/publish
- React + TypeScript + Vite + Tailwind CSS v4; Express + TypeScript + Joi; PostgreSQL + Prisma; Docker Compose
- All submitted profiles are **drafts** unless explicitly published

## Fast start with Docker

Prerequisites: Docker and Docker Compose. **Docker is not required if running local services manually.**

1. Copy the environment template: `cp .env.example .env` (Windows PowerShell: `Copy-Item .env.example .env`).
2. Set **strong**, random values for `POSTGRES_PASSWORD` and `JWT_SECRET` in `.env`. Set `ADMIN_EMAIL`.
3. Generate a bcrypt password hash, using a terminal in `backend`:
   ```sh
   npm install
   node -e "require('bcryptjs').hash('YOUR_STRONG_PASSWORD', 12).then(console.log)"
   ```
   Paste the resulting hash as `ADMIN_PASSWORD_HASH` in root `.env`. **Double each `$` to `$$` in the Compose `.env` file**, or Compose will interpolate the bcrypt hash and break authentication. For example `$2b$12$...` becomes `$$2b$$12$$...` in `.env`.
4. From project root run `docker compose up --build -d`.
5. Browse **http://localhost:8080** and sign in at **http://localhost:8080/admin**.

The frontend container is nginx and proxies `/api` to the backend container. The backend starts by syncing the schema with Prisma `db push` (ideal for a first local prototype). For production deployments, use **Prisma migrations** (`prisma migrate dev` to create migrations; `prisma migrate deploy` on deploy) instead of `db push`.

## Without Docker (development)

Start a PostgreSQL server and create a database. In `backend`, copy root env settings into `backend/.env`, replacing `DATABASE_URL` with a proper PostgreSQL connection string, and set `FRONTEND_ORIGIN=http://localhost:5173`. **Use unescaped `$` in your bcrypt hash when running without Compose.** Then:

```sh
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev
```

In another terminal:

```sh
cd frontend
npm install
npm run dev
```

Visit http://localhost:5173. Vite proxies `/api` to localhost:4000.

## API

- `GET /api/investors`, `/api/startups`, `/api/builders`: published only
- `GET /api/<kind>?all=1`: drafts included **only if authenticated**
- `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`
- Admin-only: `POST /api/<kind>`, `PUT /api/<kind>/:id`, `DELETE /api/<kind>/:id`

## Hosting and security notes

- The nginx reverse proxy arrangement works for single-host Docker deployments. For separate frontend and backend domains, set `VITE_API_URL` at frontend *build time*, `FRONTEND_ORIGIN` on the backend, and review cookie `SameSite`, `Secure`, and CSRF defenses. **Same-origin hosting is preferred.**
- JWT admin cookie expires in 8 hours; signed, HttpOnly and SameSite=Lax. For any publicly reachable production instance, use HTTPS, `NODE_ENV=production`, a strong password and secret, proper domain config, and login monitoring. Use CSRF tokens if you deploy in a cross-site configuration.
- The admin identity is configured through environment variables (no self-service registration). Rotate credentials on compromise.
- Do not publish anyone's conversation, LinkedIn, or personal information without consent. Profiles are drafts by default.
- Use your own independent branding rather than official Slush logos or implying endorsement.
