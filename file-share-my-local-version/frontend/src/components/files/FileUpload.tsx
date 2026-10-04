import { useMemo, useRef, useState } from "react";
import type { DragEvent } from "react";
import { CheckCircle2, CloudUpload, FileWarning, ShieldCheck, X } from "lucide-react";
import toast from "react-hot-toast";

import { getApiError } from "../../api/axios";
import { useUploadFile } from "../../hooks/useFiles";
import {
  ALLOWED_FILE_EXTENSIONS,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
} from "../../utils/constants";
import { formatFileSize } from "../../utils/formatFileSize";

function getExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() || "";
}

export default function FileUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const selectedFileError = useMemo(() => {
    if (!selectedFile) return "";
    const extension = getExtension(selectedFile.name);

    if (!ALLOWED_FILE_EXTENSIONS.includes(extension)) {
      return "This file type is not allowed.";
    }
    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      return `File must be ${MAX_FILE_SIZE_MB} MB or smaller.`;
    }
    return "";
  }, [selectedFile]);

  const uploadMutation = useUploadFile();

  function uploadSelectedFile() {
    if (!selectedFile) return;
    uploadMutation.mutate(
      {
        file: selectedFile,
        onUploadProgress: (event) => {
          if (!event.total) return;
          setProgress(Math.round((event.loaded * 100) / event.total));
        },
      },
      {
        onSuccess: () => {
          toast.success("File scanned and uploaded.");
          setSelectedFile(null);
          setProgress(0);
        },
        onError: (error) => {
          toast.error(getApiError(error, "Upload failed."));
          setProgress(0);
        },
      },
    );
  }

  function handleFile(file: File) {
    setSelectedFile(file);
    setProgress(0);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function handleSubmit() {
    if (!selectedFile || selectedFileError) {
      toast.error(selectedFileError || "Choose a file first.");
      return;
    }
    uploadSelectedFile();
  }

  const statusText = uploadMutation.isPending
    ? progress < 100
      ? "Uploading file to scanner..."
      : "Finishing malware scan and secure storage..."
    : "Files are scanned before they are stored.";

  return (
    <section className="surface p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Upload file</h2>
          <p className="mt-1 text-sm text-slate-500">
            PDF, DOCX, TXT, PNG, JPG, JPEG up to {MAX_FILE_SIZE_MB} MB.
          </p>
        </div>
        <div className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 sm:text-sm">
          <ShieldCheck size={15} className="shrink-0" />
          Malware scan
        </div>
      </div>

      <div
        className={`mt-5 rounded-xl border-2 border-dashed p-6 text-center ${
          isDragging ? "border-slate-500 bg-slate-100" : "border-slate-200 bg-slate-50"
        }`}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        <CloudUpload className="mx-auto text-slate-500" size={34} />
        <p className="mt-3 text-sm font-medium text-slate-800">Drag a file here</p>
        <p className="mt-1 text-sm text-slate-500">or choose one from your computer</p>
        <button
          type="button"
          className="btn-secondary mt-4"
          onClick={() => inputRef.current?.click()}
          disabled={uploadMutation.isPending}
        >
          Browse files
        </button>
      </div>

      {selectedFile && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-950">{selectedFile.name}</p>
              <p className="mt-1 text-sm text-slate-500">{formatFileSize(selectedFile.size)}</p>
            </div>
            <button
              type="button"
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              onClick={() => setSelectedFile(null)}
              disabled={uploadMutation.isPending}
              title="Remove selected file"
            >
              <X size={17} />
            </button>
          </div>

          {selectedFileError ? (
            <p className="mt-3 flex items-center gap-2 text-sm text-red-600">
              <FileWarning size={16} />
              {selectedFileError}
            </p>
          ) : (
            <p className="mt-3 flex items-center gap-2 text-sm text-emerald-700">
              <CheckCircle2 size={16} />
              Ready for validation and malware scan.
            </p>
          )}
        </div>
      )}

      {uploadMutation.isPending && (
        <div className="mt-4">
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full bg-slate-950" style={{ width: `${Math.max(progress, 12)}%` }} />
          </div>
          <p className="mt-2 text-sm text-slate-500">{statusText}</p>
        </div>
      )}

      <button
        type="button"
        className="btn-primary mt-5 w-full"
        onClick={handleSubmit}
        disabled={!selectedFile || Boolean(selectedFileError) || uploadMutation.isPending}
      >
        <CloudUpload size={17} />
        {uploadMutation.isPending ? "Uploading..." : "Upload securely"}
      </button>
    </section>
  );
}
