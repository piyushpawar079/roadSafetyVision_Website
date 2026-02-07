// ===========================================
// EVIDENCE IMAGE VIEWER COMPONENT
// ===========================================

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ViolationEvidence } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ZoomIn, ZoomOut, X, ImageOff } from 'lucide-react';

interface EvidenceViewerProps {
  evidence: ViolationEvidence;
  className?: string;
}

type EvidenceKey = 'violation_full' | 'bike_crop' | 'plate_crop' | 'plate_processed';

const evidenceLabels: Record<EvidenceKey, string> = {
  violation_full: 'Full Scene',
  bike_crop: 'Vehicle Crop',
  plate_crop: 'Plate Crop',
  plate_processed: 'Processed Plate',
};

export function EvidenceViewer({ evidence, className }: EvidenceViewerProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<string>('');
  const [zoom, setZoom] = useState(1);

  const evidenceItems = Object.entries(evidence).filter(
    ([_, value]) => value !== null && value !== ''
  ) as [EvidenceKey, string][];

  const handleImageClick = (url: string, label: string) => {
    setSelectedImage(url);
    setSelectedLabel(label);
    setZoom(1);
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));

  return (
    <>
      <div className={cn('grid grid-cols-2 gap-3', className)}>
        {evidenceItems.map(([key, url]) => (
          <button
            key={key}
            onClick={() => handleImageClick(url, evidenceLabels[key])}
            className="group relative aspect-video overflow-hidden rounded-lg border bg-muted transition-all hover:border-primary hover:shadow-md"
          >
            <Image
              src={url}
              alt={evidenceLabels[key]}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="absolute bottom-0 left-0 right-0 p-2">
              <span className="text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                {evidenceLabels[key]}
              </span>
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
              <div className="rounded-full bg-white/90 p-2">
                <ZoomIn className="h-4 w-4 text-gray-700" />
              </div>
            </div>
          </button>
        ))}

        {evidenceItems.length === 0 && (
          <div className="col-span-2 flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-muted-foreground">
            <ImageOff className="h-8 w-8 mb-2" />
            <span className="text-sm">No evidence images available</span>
          </div>
        )}
      </div>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedLabel}</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <div className="absolute right-2 top-2 z-10 flex gap-2">
              <Button
                variant="secondary"
                size="icon"
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={handleZoomIn}
                disabled={zoom >= 3}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
            <div className="overflow-auto rounded-lg bg-muted" style={{ maxHeight: '70vh' }}>
              {selectedImage && (
                <div
                  className="relative transition-transform duration-200"
                  style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: 'center center',
                  }}
                >
                  <Image
                    src={selectedImage}
                    alt={selectedLabel}
                    width={1200}
                    height={800}
                    className="w-full h-auto"
                  />
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}