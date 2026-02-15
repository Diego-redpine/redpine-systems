'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePortalSession } from './PortalContext';

interface PortalDocumentsProps {
  blockProps: Record<string, string>;
  inBuilder: boolean;
  styles?: string;
  heading?: string;
  accentColor?: string;
  allowSigning?: boolean;
  [key: string]: unknown;
}

interface DocumentItem {
  id: string;
  title: string;
  type: 'waiver' | 'contract' | 'policy' | 'form';
  status: 'signed' | 'pending' | 'expired';
  date?: string;
  required?: boolean;
}

const DEMO_DOCUMENTS: DocumentItem[] = [
  { id: 'd1', title: 'Liability Waiver 2026', type: 'waiver', status: 'pending', required: true },
  { id: 'd2', title: 'Code of Conduct', type: 'policy', status: 'signed', date: 'Jan 5, 2026' },
  { id: 'd3', title: 'Photo/Video Release', type: 'form', status: 'pending', required: false },
  { id: 'd4', title: 'Membership Agreement', type: 'contract', status: 'signed', date: 'Dec 1, 2025' },
  { id: 'd5', title: 'Emergency Contact Form', type: 'form', status: 'signed', date: 'Jan 5, 2026' },
];

const DOC_ICONS: Record<string, string> = {
  waiver: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25',
  contract: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
  policy: 'M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z',
  form: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25',
};

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  signed: { bg: '#10B98115', text: '#10B981', label: 'Signed' },
  pending: { bg: '#F59E0B15', text: '#F59E0B', label: 'Pending' },
  expired: { bg: '#EF444415', text: '#EF4444', label: 'Expired' },
};

export const PortalDocuments: React.FC<PortalDocumentsProps> = ({
  blockProps,
  inBuilder,
  styles,
  heading = 'Documents & Waivers',
  accentColor = '#1A1A1A',
  allowSigning = true,
}) => {
  const session = usePortalSession();
  const [documents, setDocuments] = useState<DocumentItem[]>(DEMO_DOCUMENTS);
  const [signingDoc, setSigningDoc] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);

  useEffect(() => {
    if (inBuilder || !session) return;
    const fetchDocs = async () => {
      try {
        const res = await fetch(`/api/portal/data?type=documents&student_id=${session.activeStudentId}`, {
          headers: { Authorization: `Bearer ${session.token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.documents) setDocuments(data.documents);
        }
      } catch { /* use demo data */ }
    };
    fetchDocs();
  }, [inBuilder, session, session?.activeStudentId]);

  // Canvas drawing handlers
  const startDraw = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    isDrawingRef.current = true;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  }, []);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1A1A1A';
    ctx.lineTo(x, y);
    ctx.stroke();
  }, []);

  const stopDraw = useCallback(() => {
    isDrawingRef.current = false;
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  const submitSignature = async (docId: string) => {
    if (inBuilder || !session) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const signatureData = canvas.toDataURL('image/png');
    try {
      const res = await fetch('/api/portal/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          action: 'sign_document',
          document_id: docId,
          student_id: session.activeStudentId,
          signature: signatureData,
        }),
      });
      if (res.ok) {
        setDocuments(prev => prev.map(d =>
          d.id === docId ? { ...d, status: 'signed' as const, date: new Date().toLocaleDateString() } : d
        ));
        setSigningDoc(null);
      }
    } catch { /* silent */ }
  };

  const pendingCount = documents.filter(d => d.status === 'pending').length;

  return (
    <div {...blockProps} className={styles || 'w-full'}>
      <div style={{ padding: 24, borderRadius: 16, border: '1px solid #E5E7EB', backgroundColor: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{heading}</h3>
          {pendingCount > 0 && (
            <span style={{
              padding: '4px 10px', borderRadius: 8,
              backgroundColor: '#F59E0B15', color: '#F59E0B',
              fontSize: 12, fontWeight: 600,
            }}>
              {pendingCount} pending
            </span>
          )}
        </div>

        {/* Signing modal */}
        {signingDoc && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20,
          }}>
            <div style={{
              backgroundColor: '#fff', borderRadius: 16, padding: 24,
              maxWidth: 500, width: '100%',
            }}>
              <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
                Sign: {documents.find(d => d.id === signingDoc)?.title}
              </h4>
              <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>
                Draw your signature below
              </p>

              <div style={{
                border: '2px dashed #D1D5DB', borderRadius: 12,
                marginBottom: 16, position: 'relative',
              }}>
                <canvas
                  ref={canvasRef}
                  width={452}
                  height={150}
                  style={{ display: 'block', cursor: 'crosshair', borderRadius: 10 }}
                  onMouseDown={startDraw}
                  onMouseMove={draw}
                  onMouseUp={stopDraw}
                  onMouseLeave={stopDraw}
                  onTouchStart={startDraw}
                  onTouchMove={draw}
                  onTouchEnd={stopDraw}
                />
                <button
                  onClick={clearCanvas}
                  style={{
                    position: 'absolute', top: 8, right: 8,
                    padding: '4px 10px', borderRadius: 6,
                    backgroundColor: '#F3F4F6', border: 'none',
                    fontSize: 11, color: '#6B7280', cursor: 'pointer',
                  }}
                >
                  Clear
                </button>
              </div>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setSigningDoc(null)}
                  style={{
                    padding: '8px 16px', borderRadius: 8,
                    backgroundColor: '#F3F4F6', border: 'none',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => submitSignature(signingDoc)}
                  style={{
                    padding: '8px 16px', borderRadius: 8,
                    backgroundColor: accentColor, color: '#fff',
                    fontSize: 13, fontWeight: 600, border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Submit Signature
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Document list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {documents.map(doc => {
            const status = STATUS_COLORS[doc.status];
            const iconPath = DOC_ICONS[doc.type] || DOC_ICONS.form;

            return (
              <div
                key={doc.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: 14, borderRadius: 12,
                  backgroundColor: doc.status === 'pending' && doc.required ? '#FEF3C715' : '#FAFAFA',
                  border: `1px solid ${doc.status === 'pending' && doc.required ? '#F59E0B30' : '#F3F4F6'}`,
                }}
              >
                {/* Icon */}
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  backgroundColor: `${accentColor}10`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
                  </svg>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>
                    {doc.title}
                    {doc.required && doc.status === 'pending' && (
                      <span style={{ color: '#EF4444', fontSize: 11 }}> *Required</span>
                    )}
                  </p>
                  <p style={{ fontSize: 12, color: '#9CA3AF', margin: '2px 0 0' }}>
                    {doc.status === 'signed' && doc.date ? `Signed ${doc.date}` : doc.type}
                  </p>
                </div>

                {/* Status + action */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <span style={{
                    padding: '3px 8px', borderRadius: 6,
                    backgroundColor: status.bg, color: status.text,
                    fontSize: 11, fontWeight: 600,
                  }}>
                    {status.label}
                  </span>
                  {doc.status === 'pending' && allowSigning && (
                    <button
                      onClick={() => !inBuilder && setSigningDoc(doc.id)}
                      style={{
                        padding: '5px 12px', borderRadius: 8,
                        backgroundColor: accentColor, color: '#fff',
                        fontSize: 12, fontWeight: 600, border: 'none',
                        cursor: inBuilder ? 'default' : 'pointer',
                      }}
                    >
                      Sign
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
