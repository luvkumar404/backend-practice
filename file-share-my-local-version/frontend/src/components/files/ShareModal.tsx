import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, Link2, Lock, ShieldOff, X } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { getApiError } from "../../api/axios";
import { useCreateShareLink, useRevokeShareLink } from "../../hooks/useShare";
import type { Share, StoredFile } from "../../types";

const shareSchema = z.object({
  expiresAt: z.string().min(1, "Choose an expiry date and time."),
  password: z.string().optional(),
});

type ShareFormValues = z.infer<typeof shareSchema>;

export default function ShareModal({
  file,
  onClose,
}: {
  file: StoredFile;
  onClose: () => void;
}) {
  const [createdShare, setCreatedShare] = useState<Share | null>(null);

  const defaultExpiry = useMemo(() => {
    const date = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return date.toISOString().slice(0, 16);
  }, []);

  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<ShareFormValues>({
    resolver: zodResolver(shareSchema),
    defaultValues: { expiresAt: defaultExpiry, password: "" },
  });

  const shareUrl = createdShare
    ? `${window.location.origin}/share/${createdShare.token}`
    : "";

  const createMutation = useCreateShareLink();
  const revokeMutation = useRevokeShareLink();

  function handleCreateShare(values: ShareFormValues) {
    createMutation.mutate(
      {
        fileId: file.id,
        data: {
          expires_at: new Date(values.expiresAt).toISOString(),
          password: values.password || null,
        },
      },
      {
        onSuccess: (share) => {
          setCreatedShare(share);
          toast.success("Share link created.");
        },
        onError: (error) => toast.error(getApiError(error, "Could not create share link.")),
      },
    );
  }

  function handleRevokeShare() {
    if (!createdShare) return;
    revokeMutation.mutate(createdShare.id, {
      onSuccess: (share) => {
        setCreatedShare(share);
        toast.success("Share link revoked.");
      },
      onError: (error) => toast.error(getApiError(error, "Could not revoke share link.")),
    });
  }

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl);
    toast.success("Share link copied.");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-soft">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Share file</h2>
            <p className="mt-1 max-w-sm truncate text-sm text-slate-500">
              {file?.original_filename}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form className="space-y-4 p-5" onSubmit={handleSubmit(handleCreateShare)}>
          <div>
            <label className="field-label" htmlFor="expiresAt">
              Expiry time
            </label>
            <input id="expiresAt" type="datetime-local" className="input-field mt-2" {...register("expiresAt")} />
            {errors.expiresAt && (
              <p className="mt-1 text-sm text-red-600">{errors.expiresAt.message}</p>
            )}
          </div>

          <div>
            <label className="field-label" htmlFor="password">
              Optional password
            </label>
            <div className="relative mt-2">
              <Lock className="pointer-events-none absolute left-3 top-3 text-slate-400" size={17} />
              <input
                id="password"
                type="password"
                className="input-field pl-10"
                placeholder="Leave empty for no password"
                {...register("password")}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full" disabled={createMutation.isPending}>
            <Link2 size={17} />
            {createMutation.isPending ? "Creating..." : "Create share link"}
          </button>
        </form>

        {createdShare && (
          <div className="border-t border-slate-200 p-5">
            <label className="field-label" htmlFor="shareUrl">
              Share link
            </label>
            <div className="mt-2 flex gap-2">
              <input id="shareUrl" className="input-field" value={shareUrl} readOnly />
              <button type="button" className="btn-secondary px-3" onClick={copyLink}>
                <Copy size={17} />
              </button>
            </div>
            <button
              type="button"
              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700 disabled:opacity-60"
              onClick={handleRevokeShare}
              disabled={createdShare.is_revoked || revokeMutation.isPending}
            >
              <ShieldOff size={16} />
              {createdShare.is_revoked ? "Link revoked" : "Revoke this link"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
