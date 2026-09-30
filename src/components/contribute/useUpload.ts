import { useCallback, useRef, useState } from "react";
import { api } from "../../lib/api";
import { withReliableType } from "../../lib/format";
import { uploadToSignedUrl } from "../../lib/upload";

export type UploadPhase = "idle" | "preparing" | "uploading" | "finalizing";

export const PHASE_LABEL: Record<UploadPhase, string> = {
  idle: "",
  preparing: "Préparation de l'envoi…",
  uploading: "Envoi du fichier…",
  finalizing: "Enregistrement…",
};

/**
 * Three-step upload shared by direct publication and proposals:
 * the API validates the metadata and returns a signed URL, the file goes
 * straight to storage (with progress), then the API finalizes.
 */
export function useUpload(endpoint: string, auth: boolean | "optional") {
  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [progress, setProgress] = useState(0);
  const busy = useRef(false);

  const run = useCallback(
    async <T,>(fields: Record<string, unknown>, rawFile: File): Promise<T> => {
      if (busy.current) throw new Error("busy");
      busy.current = true;
      const file = withReliableType(rawFile);
      try {
        setPhase("preparing");
        setProgress(0);
        const prepared = await api<{ uploadUrl: string; path: string } & Record<string, unknown>>(endpoint, {
          auth,
          body: {
            ...fields,
            action: "prepare",
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
          },
        });

        setPhase("uploading");
        await uploadToSignedUrl(prepared.uploadUrl, file, setProgress);

        setPhase("finalizing");
        const { uploadUrl: _url, ...rest } = prepared;
        void _url;
        return await api<T>(endpoint, {
          auth,
          timeoutMs: 30000,
          body: { ...fields, ...rest, action: "finalize", fileName: file.name },
        });
      } finally {
        busy.current = false;
        setPhase("idle");
      }
    },
    [auth, endpoint],
  );

  return { run, phase, progress, busy: phase !== "idle" };
}
