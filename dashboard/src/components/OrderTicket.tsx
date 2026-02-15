'use client';

interface OrderTicketProps {
  orderNumber: string;
  customerName: string;
  orderType: string;
  tableNumber?: string;
  items: {
    name: string;
    quantity: number;
    modifiers?: string[];
    specialInstructions?: string;
  }[];
  specialInstructions?: string;
  createdAt: string;
}

// Print-optimized kitchen ticket layout (80mm thermal printer width)
export default function OrderTicket({
  orderNumber,
  customerName,
  orderType,
  tableNumber,
  items,
  specialInstructions,
  createdAt,
}: OrderTicketProps) {
  const handlePrint = () => {
    window.print();
  };

  const time = new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const typeLabel = orderType === 'dine_in' ? 'DINE IN' : orderType === 'pickup' ? 'PICKUP' : 'DELIVERY';

  return (
    <>
      {/* Screen button */}
      <button
        onClick={handlePrint}
        className="print:hidden px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1.5"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        Print
      </button>

      {/* Print-only ticket */}
      <div className="hidden print:block" style={{ width: '80mm', fontFamily: 'monospace', fontSize: '12px', padding: '4mm' }}>
        <div style={{ textAlign: 'center', borderBottom: '2px dashed #000', paddingBottom: '4mm', marginBottom: '4mm' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{orderNumber}</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '2mm' }}>{typeLabel}</div>
          {tableNumber && <div style={{ fontSize: '14px' }}>Table {tableNumber}</div>}
          <div style={{ marginTop: '2mm' }}>{time}</div>
        </div>

        <div style={{ borderBottom: '1px dashed #000', paddingBottom: '4mm', marginBottom: '4mm' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '2mm' }}>{customerName}</div>
        </div>

        <div style={{ borderBottom: '2px dashed #000', paddingBottom: '4mm', marginBottom: '4mm' }}>
          {items.map((item, idx) => (
            <div key={idx} style={{ marginBottom: '3mm' }}>
              <div style={{ fontWeight: 'bold' }}>
                {item.quantity}x {item.name}
              </div>
              {item.modifiers && item.modifiers.length > 0 && (
                <div style={{ paddingLeft: '4mm', fontSize: '11px' }}>
                  {item.modifiers.map((mod, i) => (
                    <div key={i}>- {mod}</div>
                  ))}
                </div>
              )}
              {item.specialInstructions && (
                <div style={{ paddingLeft: '4mm', fontSize: '11px', fontStyle: 'italic' }}>
                  ** {item.specialInstructions}
                </div>
              )}
            </div>
          ))}
        </div>

        {specialInstructions && (
          <div style={{ borderBottom: '1px dashed #000', paddingBottom: '4mm', marginBottom: '4mm' }}>
            <div style={{ fontWeight: 'bold', fontSize: '11px' }}>NOTES:</div>
            <div style={{ fontSize: '11px' }}>{specialInstructions}</div>
          </div>
        )}

        <div style={{ textAlign: 'center', fontSize: '10px', marginTop: '4mm' }}>
          Powered by Red Pine
        </div>
      </div>
    </>
  );
}
