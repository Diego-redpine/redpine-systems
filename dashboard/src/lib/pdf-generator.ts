import jsPDF from 'jspdf';

/**
 * Generate a PDF from a document title + HTML content.
 * Uses jsPDF to create a simple styled PDF.
 */
export function generateDocumentPDF(title: string, htmlContent: string) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;
  let y = margin;

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(title, margin, y);
  y += 12;

  // Date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(128, 128, 128);
  doc.text(new Date().toLocaleDateString(), margin, y);
  y += 8;

  // Divider
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // Parse HTML content into text blocks
  doc.setTextColor(0, 0, 0);
  const tempDiv = typeof document !== 'undefined' ? document.createElement('div') : null;

  if (tempDiv) {
    tempDiv.innerHTML = htmlContent;
    const elements = tempDiv.querySelectorAll('h1, h2, h3, p, li, blockquote, hr');

    elements.forEach((el) => {
      // Check page overflow
      if (y > 270) {
        doc.addPage();
        y = margin;
      }

      const tag = el.tagName.toLowerCase();
      const text = el.textContent?.trim() || '';

      if (!text && tag !== 'hr') return;

      switch (tag) {
        case 'h1':
          doc.setFontSize(18);
          doc.setFont('helvetica', 'bold');
          y += 4;
          break;
        case 'h2':
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          y += 3;
          break;
        case 'h3':
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          y += 2;
          break;
        case 'li':
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          break;
        case 'blockquote':
          doc.setFontSize(10);
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(100, 100, 100);
          break;
        case 'hr':
          doc.setDrawColor(200, 200, 200);
          doc.line(margin, y, pageWidth - margin, y);
          y += 6;
          return;
        default:
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
      }

      const prefix = tag === 'li' ? '  \u2022 ' : '';
      const lines = doc.splitTextToSize(prefix + text, maxWidth);
      doc.text(lines, margin, y);
      y += lines.length * (doc.getFontSize() * 0.5) + 3;

      // Reset color after blockquote
      if (tag === 'blockquote') {
        doc.setTextColor(0, 0, 0);
      }
    });
  } else {
    // Server-side fallback: strip HTML tags
    const plainText = htmlContent.replace(/<[^>]+>/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(plainText, maxWidth);
    doc.text(lines, margin, y);
  }

  doc.save(`${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
}

/**
 * Generate an invoice PDF from record data.
 */
export function generateInvoicePDF(record: Record<string, unknown>, businessName?: string) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = margin;

  // Header
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', margin, y);

  if (businessName) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(businessName, pageWidth - margin, y, { align: 'right' });
  }
  y += 12;

  // Invoice details
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const details = [
    ['Invoice #', String(record.invoice_number || record.id || 'N/A')],
    ['Date', String(record.date || record.created_at || new Date().toLocaleDateString())],
    ['Due Date', String(record.due_date || 'N/A')],
    ['Status', String(record.status || 'Pending')],
  ];

  details.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label + ':', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, margin + 30, y);
    y += 6;
  });

  y += 4;

  // Client
  if (record.client_name || record.client) {
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', margin, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.text(String(record.client_name || record.client), margin, y);
    y += 10;
  }

  // Divider
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // Amount
  const amount = record.amount || record.total || record.price || 0;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Total Amount:', margin, y);
  doc.text(
    `$${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    pageWidth - margin,
    y,
    { align: 'right' }
  );
  y += 8;

  // Description
  if (record.description || record.notes) {
    y += 4;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    const descLines = doc.splitTextToSize(
      String(record.description || record.notes),
      pageWidth - margin * 2
    );
    doc.text(descLines, margin, y);
  }

  doc.save(`invoice_${String(record.invoice_number || record.id || 'draft')}.pdf`);
}
