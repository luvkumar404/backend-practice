import { useState } from "react";
import { Download, KeyRound, Link2, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";

import { getApiError } from "../api/axios";
import { useDownloadSharedFile } from "../hooks/useShare";
import type { SharedDownload } from "../types";

export default function PublicShare() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [download, setDownload] = useState<SharedDownload | null>(null);

  const mutation = useDownloadSharedFile();

  function handleGetDownloadLink() {
    if (!token) return;
    mutation.mutate(
      { token, password: password || null },
      {
        onSuccess: (data) => {
          setDownload(data);
          toast.success("Secure download link is ready.");
        },
        onError: (error) => toast.error(getApiError(error, "This share link is invalid or expired.")),
      },
    );
  }

  return (
    <main className="page-shell flex min-h-[calc(100vh-4rem)] items-center justify-center py-10">
      <section className="surface w-full max-w-lg overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-950 p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/10">
              <Link2 size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Shared file</h1>
              <p className="mt-1 text-sm text-slate-300">Validate this secure link to download.</p>
            </div>
          </div>
        </div>

        <div className="space-y-5 p-6">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <div className="flex gap-2">
              <ShieldAlert className="mt-0.5 shrink-0" size={17} />
              Expired or revoked links are rejected by the backend before a download URL is issued.
            </div>
          </div>

          <div>
            <label className="field-label" htmlFor="password">
              Password
            </label>
            <div className="relative mt-2">
              <KeyRound className="pointer-events-none absolute left-3 top-3 text-slate-400" size={17} />
              <input
                id="password"
                type="password"
                className="input-field pl-10"
                placeholder="Enter password if required"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
          </div>

          <button
            type="button"
            className="btn-primary w-full"
            onClick={handleGetDownloadLink}
            disabled={mutation.isPending}
          >
            <Download size={17} />
            {mutation.isPending ? "Checking link..." : "Get download link"}
          </button>

          {download && (
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-950">{download.file_name}</p>
              <a
                href={download.download_url}
                className="btn-secondary mt-3 w-full"
                target="_blank"
                rel="noreferrer"
              >
                <Download size={17} />
                Download file
              </a>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
