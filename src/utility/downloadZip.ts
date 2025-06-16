import JSZip from "jszip";
import { saveAs } from "file-saver";

export async function downloadMediaZip(
  companyName: string,
  mediaList: { title: string; content: string }[]
) {
  const zip = new JSZip();

  for (const media of mediaList) {
    const response = await fetch(media.content);
    const blob = await response.blob();
    zip.file(media.title, blob);
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  saveAs(zipBlob, `${companyName}_media.zip`);
}
