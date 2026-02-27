'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { DashboardColors } from '@/types/config';
import QRCode from 'qrcode';

interface QRCodeGeneratorProps {
  subdomain: string;
  colors: DashboardColors;
}

function QRCodeSvg({ url, size = 200 }: { url: string; size?: number }) {
  const [svgMarkup, setSvgMarkup] = useState<string>('');

  useEffect(() => {
    QRCode.toString(url, {
      type: 'svg',
      width: size,
      margin: 1,
      color: { dark: '#000000', light: '#FFFFFF' },
      errorCorrectionLevel: 'M',
    }).then(svg => {
      // Make SVG responsive — remove fixed width/height, let container control size
      const responsiveSvg = svg
        .replace(/width="[^"]*"/, 'width="100%"')
        .replace(/height="[^"]*"/, 'height="100%"');
      setSvgMarkup(responsiveSvg);
    }).catch(() => setSvgMarkup(''));
  }, [url, size]);

  if (!svgMarkup) {
    return <div className="w-24 h-24 bg-gray-100 rounded animate-pulse mx-auto" />;
  }

  return (
    <div
      className="mx-auto mb-2 w-24 h-24 overflow-hidden"
      dangerouslySetInnerHTML={{ __html: svgMarkup }}
    />
  );
}

export default function QRCodeGenerator({ subdomain, colors }: QRCodeGeneratorProps) {
  const [tableCount, setTableCount] = useState(10);
  const [showCodes, setShowCodes] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const textMain = colors.headings || '#1A1A1A';
  const textMuted = colors.icons || '#6B7280';
  const buttonBg = colors.buttons || '#3B82F6';
  const cardBg = colors.cards || '#FFFFFF';
  const borderColor = colors.borders || '#E5E7EB';

  const baseUrl = `${subdomain}.redpine.systems/order`;

  const handleDownloadAll = useCallback(async () => {
    // Generate all QR codes as PNG data URLs and trigger downloads
    for (let i = 1; i <= tableCount; i++) {
      const url = `https://${baseUrl}?table=${i}`;
      try {
        const dataUrl = await QRCode.toDataURL(url, {
          width: 400,
          margin: 2,
          errorCorrectionLevel: 'M',
        });
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `table-${i}-qr.png`;
        link.click();
      } catch {
        // Skip failed QR codes
      }
    }
  }, [tableCount, baseUrl]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 shadow-sm" style={{ backgroundColor: cardBg }}>
      <h3 className="text-base font-semibold mb-2" style={{ color: textMain }}>Table QR Codes</h3>
      <p className="text-sm mb-4" style={{ color: textMuted }}>
        Generate QR codes for each table. Customers scan to order directly from their phone.
      </p>

      <div className="flex items-center gap-3 mb-4">
        <label className="text-sm font-medium" style={{ color: textMain }}>Number of tables:</label>
        <input
          type="number"
          min={1}
          max={100}
          value={tableCount}
          onChange={(e) => setTableCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
          className="w-20 px-3 py-1.5 border text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-200"
          style={{ borderColor }}
        />
        <button
          onClick={() => setShowCodes(!showCodes)}
          className="px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
          style={{ backgroundColor: buttonBg }}
        >
          {showCodes ? 'Hide' : 'Generate'} QR Codes
        </button>
        {showCodes && (
          <>
            <button
              onClick={handlePrint}
              className="px-4 py-2 text-sm font-medium border transition-colors hover:bg-gray-50"
              style={{ borderColor }}
            >
              Print All
            </button>
            <button
              onClick={handleDownloadAll}
              className="px-4 py-2 text-sm font-medium border transition-colors hover:bg-gray-50"
              style={{ borderColor }}
            >
              Download PNGs
            </button>
          </>
        )}
      </div>

      {showCodes && (
        <div ref={printRef} className="grid grid-cols-2 sm:grid-cols-3 gap-4 print:grid-cols-3">
          {Array.from({ length: tableCount }, (_, i) => i + 1).map(tableNum => {
            const url = `https://${baseUrl}?table=${tableNum}`;
            return (
              <div key={tableNum} className="border p-4 text-center" style={{ borderColor }}>
                <QRCodeSvg url={url} />
                <p className="text-lg font-bold" style={{ color: textMain }}>Table {tableNum}</p>
                <p className="text-xs mt-1 break-all" style={{ color: textMuted }}>{url}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
