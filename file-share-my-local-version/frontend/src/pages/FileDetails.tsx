import { useState } from "react";
import { ArrowLeft, Calendar, Database, Download, FileText, Share2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";

import { getApiError } from "../api/axios";
import LoadingSkeleton from "../components/common/LoadingSkeleton";
import ShareModal from "../components/files/ShareModal";
import { useDeleteFile, useFile } from "../hooks/useFiles";
import { formatDate } from "../utils/formatDate";
import { formatFileSize } from "../utils/formatFileSize";
import type { LucideIcon } from "lucide-react";

export default function FileDetails() {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const [showShare, setShowShare] = useState(false);
  const fileQuery = useFile(fileId);
  const deleteMutation = useDeleteFile();

  function handleDelete() {
    if (!fileId) return;
    deleteMutation.mutate(fileId, {
      onSuccess: () => {
        toast.success("File deleted.");
        navigate("/dashboard");
      },
      onError: (error) => toast.error(getApiError(error, "Could not delete file.")),
    });
  }

  const file = fileQuery.data;

  return (
    <main className="page-shell py-8">
      <Link to="/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950">
        <ArrowLeft size={17} />
        Back to dashboard
      </Link>

      {fileQuery.isLoading ? (
        <LoadingSkeleton rows={4} />
      ) : fileQuery.isError ? (
        <div className="surface p-6 text-sm text-red-600">
          {getApiError(fileQuery.error, "Could not load file details.")}
        </div>
      ) : file ? (
        <>
          <section className="surface overflow-hidden">
            <div className="border-b border-slate-200 bg-white p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 gap-4">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-700">
                    <FileText size={28} />
                  </div>
                  <div className="min-w-0">
                    <h1 className="truncate text-2xl font-bold text-slate-950">
                      {file.original_filename}
                    </h1>
                    <p className="mt-2 text-sm text-slate-500">
                      Stored as {file.stored_filename}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowShare(true)}
                    title="Create a secure link before downloading"
                  >
                    <Download size={17} />
                    Download
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => setShowShare(true)}>
                    <Share2 size={17} />
                    Share
                  </button>
                  <button
                    type="button"
                    className="btn-secondary text-red-600 hover:border-red-200 hover:bg-red-50"
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 size={17} />
                    Delete
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
              <Metadata label="Type" value={file.extension.toUpperCase()} icon={FileText} />
              <Metadata label="Size" value={formatFileSize(file.size_bytes)} icon={Database} />
              <Metadata label="Content type" value={file.content_type || "Unknown"} icon={Database} />
              <Metadata label="Uploaded" value={formatDate(file.created_at)} icon={Calendar} />
            </div>
          </section>

          <section className="mt-6 surface p-6">
            <h2 className="text-lg font-semibold text-slate-950">Access logs</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              The backend stores access logs, but it does not currently expose a logs endpoint.
              This section is ready to show logs when an endpoint is added.
            </p>
          </section>
        </>
      ) : null}

      {showShare && file && <ShareModal file={file} onClose={() => setShowShare(false)} />}
    </main>
  );
}

function Metadata({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
        <Icon size={16} />
        {label}
      </div>
      <p className="mt-2 break-words font-semibold text-slate-950">{value}</p>
    </div>
  );
}
