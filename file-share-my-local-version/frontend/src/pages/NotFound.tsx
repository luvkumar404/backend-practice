import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="page-shell flex min-h-[calc(100vh-4rem)] items-center justify-center py-10">
      <section className="surface max-w-md p-6 text-center">
        <p className="text-sm font-semibold text-slate-500">404</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950">Page not found</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          The page you are looking for does not exist or may have moved.
        </p>
        <Link to="/" className="btn-primary mt-5">
          Go home
        </Link>
      </section>
    </main>
  );
}
