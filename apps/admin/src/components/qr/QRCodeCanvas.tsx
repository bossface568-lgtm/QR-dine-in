import React, { useEffect, useRef, useState } from 'react';
import { qrService } from '@qrdine/lib';
import { Spinner } from '@qrdine/ui';

interface QRCodeCanvasProps {
  url: string;
  size?: number;
  logoUrl?: string | null;
  restaurantName?: string;
  tableLabel?: string;
  className?: string;
}

export const QRCodeCanvas: React.FC<QRCodeCanvasProps> = ({
  url,
  size = 240,
  logoUrl,
  restaurantName,
  tableLabel,
  className = '',
}) => {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function renderQR() {
      if (!url) return;
      try {
        setLoading(true);
        setError(false);
        const result = await qrService.generateQRCodeDataURL(url, {
          size: size * 2, // render at high resolution
          logoUrl,
          darkColor: '#0F172A',
          lightColor: '#FFFFFF',
        });
        if (isMounted) {
          setDataUrl(result);
        }
      } catch (err) {
        console.error('Failed to generate QR canvas:', err);
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    renderQR();

    return () => {
      isMounted = false;
    };
  }, [url, size, logoUrl]);

  if (loading) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-white rounded-2xl p-4 shadow-md border border-slate-200 ${className}`}
        style={{ width: size, height: size }}
      >
        <Spinner size="md" />
        <span className="text-xs text-slate-400 mt-2">Generating QR...</span>
      </div>
    );
  }

  if (error || !dataUrl) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-slate-900 rounded-2xl p-4 border border-red-500/30 text-red-400 text-xs ${className}`}
        style={{ width: size, height: size }}
      >
        <span>Failed to load QR</span>
      </div>
    );
  }

  return (
    <div className={`relative flex flex-col items-center justify-center bg-white rounded-2xl p-3 border border-slate-200/80 shadow-md ${className}`}>
      {restaurantName && (
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-800 mb-1 max-w-full truncate px-1">
          {restaurantName}
        </span>
      )}
      
      <img
        src={dataUrl}
        alt={tableLabel ? `QR Code for ${tableLabel}` : 'Table QR Code'}
        className="rounded-lg object-contain transition-transform duration-200 hover:scale-[1.02]"
        style={{ width: size - 24, height: size - 24 }}
      />

      {tableLabel && (
        <div className="mt-1.5 flex items-center justify-center gap-1.5 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200/60">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
          <span className="text-xs font-bold text-orange-950">{tableLabel}</span>
        </div>
      )}
    </div>
  );
};
