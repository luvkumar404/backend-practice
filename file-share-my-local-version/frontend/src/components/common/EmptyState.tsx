import { FilePlus2 } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="surface flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-xl bg-slate-100 text-slate-600">
        <FilePlus2 size={26} />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-950">No files uploaded yet</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        Upload a document or image to scan it, store it privately, and create a secure share link.
      </p>
    </div>
  );
}
