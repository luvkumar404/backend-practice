# Secure File Share Frontend

React + Vite frontend for the secure file-sharing backend.

## Tech Stack

- React with Vite
- Tailwind CSS
- React Router DOM
- Axios
- TanStack Query
- React Hook Form
- Zod
- Lucide React
- React Hot Toast

## Setup

1. Install dependencies.

```bash
cd frontend
npm install
```

2. Create the environment file.

```bash
copy .env.example .env
```

3. Confirm the API base URL.

```text
VITE_API_BASE_URL=http://localhost:8000
```

4. Start the development server.

```bash
npm run dev
```

Open the app at the URL shown by Vite, usually:

```text
http://localhost:5173
```

## Backend Endpoint Mapping

Authentication:

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

Files:

- `GET /files`
- `POST /files`
- `GET /files/{file_id}`
- `DELETE /files/{file_id}`

Sharing:

- `POST /shares/files/{file_id}`
- `POST /shares/{token}/download`
- `POST /shares/{share_id}/revoke`

## Notes

- The JWT token is stored in `localStorage` for now.
- Axios automatically attaches the token as a Bearer token.
- TanStack Query caches file lists and refreshes them after upload/delete/share actions.
- The register page includes a name field for the UI, but the current backend only accepts email and password.
- The file details page is ready to show access logs when the backend exposes a logs endpoint.

## Structure

```text
src/
  api/
  components/
    auth/
    common/
    files/
    layout/
  context/
  hooks/
  pages/
  routes/
  utils/
```
