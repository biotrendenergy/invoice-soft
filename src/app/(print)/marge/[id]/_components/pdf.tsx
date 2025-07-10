"use client";
export default function PdfViewer({ base64Pdf }: { base64Pdf: string }) {
  return (
    <iframe
      src={`data:application/pdf;base64,${base64Pdf}`}
      width="100%"
      height="1000px"
    />
  );
}
