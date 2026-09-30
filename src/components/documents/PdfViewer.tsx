// Loaded on demand (React.lazy): pdf.js only downloads when a PDF preview
// is actually opened, instead of weighing on every page of the site.
import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import workerUrl from "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url";
import { ChevronDown } from "lucide-react";
import { Button } from "../ui/Button";
import { Skeleton } from "../ui/Feedback";

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

const PAGE_STEP = 4;
// Limits canvas memory on high-density phone screens.
const PIXEL_RATIO = Math.min(2, typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1);

function PageSkeleton() {
  return <Skeleton className="mx-auto aspect-[1/1.414] w-full max-w-[820px] rounded-md" />;
}

export default function PdfViewer({
  url,
  onPages,
  onError,
}: {
  url: string;
  onPages?: (count: number) => void;
  onError?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [pages, setPages] = useState(0);
  const [visible, setVisible] = useState(PAGE_STEP);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => setWidth(Math.min(820, el.clientWidth));
    measure();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const shown = Math.min(visible, pages);

  return (
    <div ref={containerRef} className="w-full">
      {width > 0 && (
        <Document
          file={url}
          onLoadSuccess={({ numPages }) => {
            setPages(numPages);
            onPages?.(numPages);
          }}
          onLoadError={() => onError?.()}
          loading={<PageSkeleton />}
          error={<span />}
          className="flex flex-col items-center gap-4"
        >
          {Array.from({ length: shown }, (_, i) => (
            <div key={i} className="w-full overflow-hidden rounded-md bg-card shadow-raised" style={{ maxWidth: width }}>
              <Page
                pageNumber={i + 1}
                width={width}
                devicePixelRatio={PIXEL_RATIO}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                loading={<PageSkeleton />}
              />
              <p className="border-t border-line py-1.5 text-center text-xs text-ink-faint">
                Page {i + 1} sur {pages}
              </p>
            </div>
          ))}
        </Document>
      )}
      {pages > shown && (
        <div className="mt-6 flex justify-center">
          <Button
            variant="outline"
            icon={<ChevronDown className="h-4 w-4" />}
            onClick={() => setVisible((v) => v + PAGE_STEP)}
          >
            Afficher les pages suivantes ({pages - shown} restante{pages - shown > 1 ? "s" : ""})
          </Button>
        </div>
      )}
    </div>
  );
}
