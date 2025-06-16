import JSZip from "jszip";
import { saveAs } from "file-saver";

// Helper function to convert base64 to Blob
function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

// Optional: Infer file extension from MIME type
function getExtensionFromMimeType(mimeType: string): string {
  const map: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/gif": "gif",
    "application/pdf": "pdf",
    "text/plain": "txt",
    "application/zip": "zip",
  };
  return map[mimeType] || "";
}

// Main function to create and download ZIP
export async function downloadMediaZip(
  companyName: string,
  mediaList: { title: string; content: string; type: string }[]
) {
  const zip = new JSZip();

  for (const media of mediaList) {
    const blob = base64ToBlob(media.content, media.type);
    const extension = getExtensionFromMimeType(media.type);
    const filename = extension ? `${media.title}.${extension}` : media.title;

    zip.file(filename, blob);
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  saveAs(zipBlob, `${companyName}_media.zip`);
}
