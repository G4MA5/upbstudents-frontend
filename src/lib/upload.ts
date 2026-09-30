import { ApiError, networkErrorMessage } from "./api";

/**
 * Sends a file to a Supabase Storage signed upload URL (returned by the
 * API), reporting progress. XMLHttpRequest is used because fetch cannot
 * report upload progress.
 */
export function uploadToSignedUrl(
  url: string,
  file: File,
  onProgress?: (ratio: number) => void,
  signal?: AbortSignal,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    // Overwrite permission is carried by the signed token itself.
    xhr.open("PUT", url);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(e.loaded / e.total);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(1);
        resolve();
      } else if (xhr.status === 413) {
        reject(new ApiError("Le fichier est trop volumineux.", 413));
      } else {
        reject(
          new ApiError(
            "L'envoi du fichier a échoué. Veuillez réessayer.",
            xhr.status,
          ),
        );
      }
    };
    xhr.onerror = () => reject(new ApiError(networkErrorMessage(), 0, "NETWORK"));
    xhr.onabort = () => reject(new ApiError("Envoi annulé.", 0, "ABORTED"));
    signal?.addEventListener("abort", () => xhr.abort());

    const body = new FormData();
    body.append("cacheControl", "3600");
    body.append("", file);
    xhr.send(body);
  });
}
