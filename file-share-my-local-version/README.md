# Secure File Sharing

A full-stack secure file-sharing application for uploading private files, scanning uploads, storing them in Cloudinary, and sharing them through expiring public links. Users can register, log in, manage their own files, create optional password-protected share links, revoke links, and download shared files through controlled API endpoints.

The project is split into a Bun + Hono backend and a React + Vite frontend. PostgreSQL is the only configured database. 

## Features

- Email/password registration and login
- JWT-based authentication
- PostgreSQL persistence with Prisma ORM
- Private file metadata management
- Cloudinary-backed file storage
- Malware scanning (ClamAV-compatible scanner integration)
- Expiring share links with optional passwords
- Share revocation
- Basic access logging for file actions
- React dashboard for upload, listing, details, and public shares

## Tech Stack

Backend:

- Bun (Runtime)
- Hono (Web Framework)
- TypeScript
- PostgreSQL
- Prisma (ORM)
- Zod (Validation)
- jsonwebtoken (Auth)
- Cloudinary (Storage)

Frontend:

- React
- Vite
- TypeScript
- Tailwind CSS
- React Router
- Axios
- TanStack Query
- React Hook Form
- Zod
- Lucide React
- React Hot Toast

## Project Structure

```text
backend/
  prisma/
    schema.prisma
  src/
    config/
    middlewares/
    routes/
    services/
    utils/
  index.ts
  package.json
  bun.lock
  .env.example
frontend/
  public/
  src/
    api/
    components/
    context/
    hooks/
    pages/
    routes/
    utils/
  .env.example
  package.json
```

## Prerequisites

- Bun 1.0+ or Node.js 20+
- PostgreSQL
- Cloudinary account credentials

## Backend Setup

Create a PostgreSQL database first. Example:

```sql
CREATE DATABASE fileshare;
```

Install backend dependencies and setup the database:

```bash
cd backend
bun install
cp .env.example .env
# Edit .env with your PostgreSQL credentials and Cloudinary keys
bunx prisma db push
bunx prisma generate
```

Start the backend development server:

```bash
bun run dev
```

The API runs at `http://localhost:8000`.

## Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Vite usually serves the app at `http://localhost:5173`.

## Environment Variables

Backend variables in `backend/.env`:

```text
DATABASE_URL="postgresql://user:password@localhost:5432/fileshare?schema=public"
JWT_SECRET_KEY="supersecretkey"
JWT_ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES="60"
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
MAX_FILE_SIZE_MB="10"
FRONTEND_URL="http://localhost:5173"
PORT="8000"
```

Frontend variables in `frontend/.env`:

```text
VITE_API_BASE_URL=http://localhost:8000
```

Never commit real `.env` files or production secrets.

## Database Management

Manage your database with Prisma:

```bash
cd backend
# Sync schema changes to database
bunx prisma db push

# Open Prisma Studio to view database content
bunx prisma studio
```

## Contribution Guidelines

1. Keep backend code inside `backend/src` and organized by domain logic.
2. Keep frontend code inside `frontend/src` using the existing modular structure.
3. Use Prisma for all database schema changes (`backend/prisma/schema.prisma`).
4. Do not commit `.env`, `node_modules`, `dist`, logs, caches, or generated temporary files.
5. Run the backend and frontend locally before opening a pull request.
6. Update this README when setup steps, environment variables, or major API behavior changes.
