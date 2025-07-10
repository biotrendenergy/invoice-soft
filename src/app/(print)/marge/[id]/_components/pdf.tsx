// components/PDFViewer.tsx
"use client";

import { Document, Page, pdfjs } from "react-pdf";
import { useState } from "react";
// import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs"; // ✅ Local worker

type Props = {
  base64Pdf: string; // "data:application/pdf;base64,..."
};

export default function PDFViewer({ base64Pdf }: Props) {
  const [numPages, setNumPages] = useState<number | null>(null);

  const onLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };
  console.log(numPages);

  return (
    <div>
      <Document
        renderMode="canvas"
        file={base64Pdf}
        className={"w-screen"}
        onLoadSuccess={onLoadSuccess}
      >
        {Array.from(new Array(numPages), (_, i) => (
          <Page
            renderTextLayer={false}
            scale={2}
            key={i}
            pageNumber={i + 1}
            renderAnnotationLayer={false}
          />
        ))}
      </Document>
    </div>
  );
}
