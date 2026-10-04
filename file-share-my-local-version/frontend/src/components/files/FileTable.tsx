import { Eye, FileText, Share2, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import { formatDate } from "../../utils/formatDate";
import { formatFileSize } from "../../utils/formatFileSize";
import type { StoredFile } from "../../types";

interface FileTableProps {
  files: StoredFile[];
  onDelete: (fileId: string) => void;
  onShare: (file: StoredFile) => void;
  isDeleting: boolean;
}

export default function FileTable({ files, onDelete, onShare, isDeleting }: FileTableProps) {
  return (
    <div className="surface hidden overflow-hidden lg:block">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-5 py-3 font-semibold">File</th>
            <th className="px-5 py-3 font-semibold">Type</th>
            <th className="px-5 py-3 font-semibold">Size</th>
            <th className="px-5 py-3 font-semibold">Uploaded</th>
            <th className="px-5 py-3 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {files.map((file) => (
            <tr key={file.id} className="bg-white hover:bg-slate-50">
              <td className="px-5 py-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-700">
                    <FileText size={18} />
                  </span>
                  <span className="truncate font-medium text-slate-900">
                    {file.original_filename}
                  </span>
                </div>
              </td>
              <td className="px-5 py-4 text-slate-600">{file.extension.toUpperCase()}</td>
              <td className="px-5 py-4 text-slate-600">{formatFileSize(file.size_bytes)}</td>
              <td className="px-5 py-4 text-slate-600">{formatDate(file.created_at)}</td>
              <td className="px-5 py-4">
                <div className="flex justify-end gap-2">
                  <Link to={`/files/${file.id}`} className="btn-secondary px-3" title="View file">
                    <Eye size={16} />
                  </Link>
                  <button
                    type="button"
                    className="btn-secondary px-3"
                    onClick={() => onShare(file)}
                    title="Share file"
                  >
                    <Share2 size={16} />
                  </button>
                  <button
                    type="button"
                    className="btn-secondary px-3 text-red-600 hover:border-red-200 hover:bg-red-50"
                    onClick={() => onDelete(file.id)}
                    disabled={isDeleting}
                    title="Delete file"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
