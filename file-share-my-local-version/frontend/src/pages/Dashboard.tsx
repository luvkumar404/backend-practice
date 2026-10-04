import { useState } from "react";
import { Files, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

import { getApiError } from "../api/axios";
import EmptyState from "../components/common/EmptyState";
import LoadingSkeleton from "../components/common/LoadingSkeleton";
import FileCard from "../components/files/FileCard";
import FileTable from "../components/files/FileTable";
import FileUpload from "../components/files/FileUpload";
import ShareModal from "../components/files/ShareModal";
import { useDeleteFile, useFiles } from "../hooks/useFiles";
import type { StoredFile } from "../types";

export default function Dashboard() {
  const [selectedFile, setSelectedFile] = useState<StoredFile | null>(null);
  const filesQuery = useFiles();
  const deleteMutation = useDeleteFile();

  function handleDelete(fileId: string) {
    deleteMutation.mutate(fileId, {
      onSuccess: () => toast.success("File deleted."),
      onError: (error) => toast.error(getApiError(error, "Could not delete file.")),
    });
  }

  const files = filesQuery.data || [];

  return (
    <main className="page-shell py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {/* <p className="flex items-center gap-2 text-sm font-medium text-emerald-700">
            <ShieldCheck size={16} />
            Protected workspace
          </p> */}
          <h1 className="mt-2 text-3xl font-bold text-slate-950">Dashboard</h1>
          <p className="mt-2 text-slate-500">
            Upload files, review metadata, and create secure share links.
          </p>
        </div>
        <div className="surface px-4 py-3">
          <p className="text-sm text-slate-500">Total files</p>
          <p className="mt-1 text-2xl font-bold text-slate-950">{files.length}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <FileUpload />

        <section>
          <div className="mb-4 flex items-center gap-2">
            <Files size={20} />
            <h2 className="text-lg font-semibold text-slate-950">Your files</h2>
          </div>

          {filesQuery.isLoading ? (
            <LoadingSkeleton rows={5} />
          ) : filesQuery.isError ? (
            <div className="surface p-6 text-sm text-red-600">
              {getApiError(filesQuery.error, "Could not load files.")}
            </div>
          ) : files.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <FileTable
                files={files}
                onDelete={handleDelete}
                onShare={setSelectedFile}
                isDeleting={deleteMutation.isPending}
              />
              <div className="grid gap-3 lg:hidden">
                {files.map((file) => (
                  <FileCard
                    key={file.id}
                    file={file}
                    onDelete={handleDelete}
                    onShare={setSelectedFile}
                    isDeleting={deleteMutation.isPending}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      </div>

      {selectedFile && <ShareModal file={selectedFile} onClose={() => setSelectedFile(null)} />}
    </main>
  );
}
