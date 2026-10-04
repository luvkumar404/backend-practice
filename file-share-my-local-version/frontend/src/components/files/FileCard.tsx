import { FileText, Share2, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import { formatDate } from "../../utils/formatDate";
import { formatFileSize } from "../../utils/formatFileSize";
import type { StoredFile } from "../../types";

interface FileCardProps {
  file: StoredFile;
  onDelete: (fileId: string) => void;
  onShare: (file: StoredFile) => void;
  isDeleting: boolean;
}

export default function FileCard({ file, onDelete, onShare, isDeleting }: FileCardProps) {
  return (
    <article className="surface p-4">
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-700">
          <FileText size={21} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-slate-950">{file.original_filename}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {file.extension.toUpperCase()} · {formatFileSize(file.size_bytes)}
          </p>
          <p className="mt-1 text-xs text-slate-400">{formatDate(file.created_at)}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Link to={`/files/${file.id}`} className="btn-secondary px-2">
          View
        </Link>
        <button type="button" className="btn-secondary px-2" onClick={() => onShare(file)}>
          <Share2 size={16} />
        </button>
        <button
          type="button"
          className="btn-secondary px-2 text-red-600 hover:border-red-200 hover:bg-red-50"
          onClick={() => onDelete(file.id)}
          disabled={isDeleting}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </article>
  );
}
