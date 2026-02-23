'use client';

/**
 * PublicWebsiteRenderer
 *
 * Renders FreeFormSaveData as a public-facing website.
 * Handles blank sections (with absolutely-positioned elements) and
 * widget sections (booking, gallery, reviews, contact, map).
 */

import { useEffect, useState } from 'react';

// ---------------------------------------------------------------------------
// Types (mirrors FreeFormSaveData / EditorElement / Section from the editor)
// ---------------------------------------------------------------------------

interface ElementBreakpoint {
  x: number;
  y: number;
  width: number;
  height: number;
  fontScale?: number;
}

interface EditorElement {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  locked: boolean;
  visible: boolean;
  deletable: boolean;
  properties: Record<string, unknown>;
  breakpoints: Record<string, ElementBreakpoint>;
  sectionId?: string;
}

interface Section {
  id: string;
  type: string;
  height: number;
  properties: Record<string, unknown>;
  elements?: string[];
  locked: boolean;
}

interface PageData {
  id: string;
  title: string;
  slug: string;
  sections: Section[];
  headerConfig: Record<string, unknown>;
  footerConfig: Record<string, unknown>;
  canvasConfig: Record<string, unknown>;
}

interface FreeFormSaveData {
  format: 'freeform';
  version: 1;
  pages: PageData[];
  elements: EditorElement[];
  currentPageIndex: number;
}

interface FormField {
  id: string;
  type: string;
  label: string;
  placeholder: string;
  required: boolean;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface PublicWebsiteRendererProps {
  websiteData: unknown;
  businessName: string;
  subdomain: string;
  colors?: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parse websiteData into typed FreeFormSaveData, returning null if invalid. */
function parseSaveData(raw: unknown): FreeFormSaveData | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw as Record<string, unknown>;
  if (data.format !== 'freeform') return null;
  return raw as FreeFormSaveData;
}

/** Resolve a color key — fall back through config colors then a default. */
function resolveColor(
  key: string,
  colors: Record<string, string>,
  fallback: string,
): string {
  return colors[key] || fallback;
}

/** Get element position for the given viewport. */
function getPosition(
  el: EditorElement,
  viewport: 'desktop' | 'tablet' | 'mobile',
): ElementBreakpoint {
  if (el.breakpoints && el.breakpoints[viewport]) {
    return el.breakpoints[viewport];
  }
  return { x: el.x, y: el.y, width: el.width, height: el.height };
}

/** Determine current viewport string from window width. */
function useViewport(): 'desktop' | 'tablet' | 'mobile' {
  const [vp, setVp] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  useEffect(() => {
    function update() {
      const w = window.innerWidth;
      if (w < 640) setVp('mobile');
      else if (w < 1024) setVp('tablet');
      else setVp('desktop');
    }
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return vp;
}

// Canvas base width used by the editor for desktop positioning.
const EDITOR_CANVAS_WIDTH = 1200;

// ---------------------------------------------------------------------------
// Element Renderers
// ---------------------------------------------------------------------------

function RenderHeading({ el }: { el: EditorElement }) {
  const p = el.properties;
  const tag = ((p.fontSize as number) || 48) >= 32 ? 'h1' : 'h2';
  const style: React.CSSProperties = {
    fontSize: `${p.fontSize || 48}px`,
    fontWeight: (p.fontWeight as number) || 700,
    fontFamily: (p.fontFamily as string) || 'Inter, sans-serif',
    color: (p.color as string) || '#1A1A1A',
    textAlign: (p.textAlign as React.CSSProperties['textAlign']) || 'left',
    lineHeight: (p.lineHeight as number) || 1.2,
    letterSpacing: p.letterSpacing ? `${p.letterSpacing}px` : undefined,
    textTransform: (p.textTransform as React.CSSProperties['textTransform']) || undefined,
    margin: 0,
    wordBreak: 'break-word',
  };

  if (tag === 'h1') return <h1 style={style}>{p.content as string}</h1>;
  return <h2 style={style}>{p.content as string}</h2>;
}

function RenderSubheading({ el }: { el: EditorElement }) {
  const p = el.properties;
  const style: React.CSSProperties = {
    fontSize: `${p.fontSize || 24}px`,
    fontWeight: (p.fontWeight as number) || 600,
    fontFamily: (p.fontFamily as string) || 'Inter, sans-serif',
    color: (p.color as string) || '#374151',
    textAlign: (p.textAlign as React.CSSProperties['textAlign']) || 'left',
    lineHeight: (p.lineHeight as number) || 1.3,
    letterSpacing: p.letterSpacing ? `${p.letterSpacing}px` : undefined,
    margin: 0,
    wordBreak: 'break-word',
  };
  return <h3 style={style}>{p.content as string}</h3>;
}

function RenderText({ el }: { el: EditorElement }) {
  const p = el.properties;
  const style: React.CSSProperties = {
    fontSize: `${p.fontSize || 16}px`,
    fontWeight: (p.fontWeight as number) || 400,
    fontFamily: (p.fontFamily as string) || 'Inter, sans-serif',
    color: (p.color as string) || '#6B7280',
    textAlign: (p.textAlign as React.CSSProperties['textAlign']) || 'left',
    lineHeight: (p.lineHeight as number) || 1.5,
    letterSpacing: p.letterSpacing ? `${p.letterSpacing}px` : undefined,
    margin: 0,
    wordBreak: 'break-word',
  };
  return <p style={style}>{p.content as string}</p>;
}

function RenderCaption({ el }: { el: EditorElement }) {
  const p = el.properties;
  const style: React.CSSProperties = {
    fontSize: `${p.fontSize || 12}px`,
    fontWeight: (p.fontWeight as number) || 400,
    fontFamily: (p.fontFamily as string) || 'Inter, sans-serif',
    color: (p.color as string) || '#9CA3AF',
    textAlign: (p.textAlign as React.CSSProperties['textAlign']) || 'left',
    lineHeight: (p.lineHeight as number) || 1.4,
    letterSpacing: p.letterSpacing ? `${p.letterSpacing}px` : undefined,
    margin: 0,
    wordBreak: 'break-word',
  };
  return <span style={style}>{p.content as string}</span>;
}

function RenderQuote({ el }: { el: EditorElement }) {
  const p = el.properties;
  const style: React.CSSProperties = {
    fontSize: `${p.fontSize || 20}px`,
    fontWeight: (p.fontWeight as number) || 400,
    fontFamily: (p.fontFamily as string) || 'Playfair Display, serif',
    color: (p.color as string) || '#4B5563',
    textAlign: (p.textAlign as React.CSSProperties['textAlign']) || 'center',
    lineHeight: (p.lineHeight as number) || 1.6,
    fontStyle: (p.fontStyle as string) || 'italic',
    margin: 0,
    wordBreak: 'break-word',
  };
  return <blockquote style={style}>{p.content as string}</blockquote>;
}

function RenderButton({ el, accentColor }: { el: EditorElement; accentColor: string }) {
  const p = el.properties;
  const bg = (p.backgroundColor as string) || accentColor;
  const style: React.CSSProperties = {
    fontSize: `${p.fontSize || 16}px`,
    fontWeight: (p.fontWeight as number) || 600,
    fontFamily: (p.fontFamily as string) || 'Inter, sans-serif',
    backgroundColor: bg,
    color: (p.color as string) || '#ffffff',
    borderRadius: `${p.borderRadius || 8}px`,
    border: (p.borderWidth as number) > 0
      ? `${p.borderWidth}px solid ${p.borderColor || 'transparent'}`
      : 'none',
    padding: `${p.paddingY || 12}px ${p.paddingX || 24}px`,
    cursor: 'pointer',
    display: 'inline-block',
    textAlign: 'center',
    textDecoration: 'none',
    transition: 'opacity 0.15s ease',
  };

  return (
    <button
      type="button"
      style={style}
      className="hover:opacity-90"
    >
      {p.content as string}
    </button>
  );
}

function RenderImage({ el }: { el: EditorElement }) {
  const p = el.properties;
  const src = p.src as string;

  if (!src) {
    // Placeholder for empty images
    return (
      <div
        className="w-full h-full bg-gray-100 flex items-center justify-center rounded-lg"
        style={{ borderRadius: `${p.borderRadius || 0}px` }}
      >
        <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  const imgStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: (p.objectFit as React.CSSProperties['objectFit']) || 'cover',
    objectPosition: (p.objectPosition as string) || 'center',
    borderRadius: `${p.borderRadius || 0}px`,
    opacity: p.opacity !== undefined ? (p.opacity as number) / 100 : 1,
    border: (p.borderWidth as number) > 0
      ? `${p.borderWidth}px ${p.borderStyle || 'solid'} ${p.borderColor || 'transparent'}`
      : 'none',
  };

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={(p.alt as string) || ''}
      style={imgStyle}
    />
  );
}

function RenderDivider({ el }: { el: EditorElement }) {
  const p = el.properties;
  return (
    <hr
      style={{
        border: 'none',
        borderTop: `${p.thickness || 1}px ${p.style || 'solid'} ${p.color || '#D1D5DB'}`,
        width: '100%',
        margin: 0,
      }}
    />
  );
}

function RenderContactForm({ el, accentColor }: { el: EditorElement; accentColor: string }) {
  const p = el.properties;
  const fields = (p.fields as FormField[]) || [];
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div
        className="flex items-center justify-center p-8 text-center"
        style={{
          backgroundColor: (p.backgroundColor as string) || '#ffffff',
          borderRadius: `${p.borderRadius || 12}px`,
          border: (p.borderWidth as number) > 0
            ? `${p.borderWidth}px solid ${p.borderColor || '#E5E7EB'}`
            : '1px solid #E5E7EB',
        }}
      >
        <p className="text-gray-700 font-medium">
          {(p.successMessage as string) || 'Thank you! We\'ll get back to you soon.'}
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: (p.backgroundColor as string) || '#ffffff',
        borderRadius: `${p.borderRadius || 12}px`,
        border: (p.borderWidth as number) > 0
          ? `${p.borderWidth}px solid ${p.borderColor || '#E5E7EB'}`
          : '1px solid #E5E7EB',
        padding: '24px',
        fontFamily: (p.fontFamily as string) || 'Inter, sans-serif',
      }}
    >
      {p.formTitle ? (
        <h3
          className="text-lg font-semibold mb-4"
          style={{ color: (p.labelColor as string) || '#1A1A1A' }}
        >
          {p.formTitle as string}
        </h3>
      ) : null}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
        className="flex flex-col gap-3"
      >
        {fields.map((field) => (
          <div key={field.id} className="flex flex-col gap-1">
            <label
              className="text-sm font-medium"
              style={{ color: (p.labelColor as string) || '#1A1A1A' }}
            >
              {field.label}
              {field.required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {field.type === 'textarea' ? (
              <textarea
                placeholder={field.placeholder}
                required={field.required}
                rows={4}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors focus:ring-2"
                style={{
                  backgroundColor: (p.inputBackgroundColor as string) || '#f5f5f5',
                  border: `1px solid ${(p.inputBorderColor as string) || '#D1D5DB'}`,
                  color: (p.inputTextColor as string) || '#1A1A1A',
                  resize: 'vertical',
                }}
              />
            ) : (
              <input
                type={field.type || 'text'}
                placeholder={field.placeholder}
                required={field.required}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors focus:ring-2"
                style={{
                  backgroundColor: (p.inputBackgroundColor as string) || '#f5f5f5',
                  border: `1px solid ${(p.inputBorderColor as string) || '#D1D5DB'}`,
                  color: (p.inputTextColor as string) || '#1A1A1A',
                }}
              />
            )}
          </div>
        ))}
        <button
          type="submit"
          className="mt-2 w-full py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
          style={{
            backgroundColor: (p.buttonBackgroundColor as string) || accentColor,
            color: (p.buttonTextColor as string) || '#ffffff',
            borderRadius: `${p.buttonBorderRadius || 8}px`,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {(p.submitButtonText as string) || 'Send Message'}
        </button>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Element Dispatcher
// ---------------------------------------------------------------------------

function RenderElement({
  el,
  accentColor,
}: {
  el: EditorElement;
  accentColor: string;
}) {
  if (!el.visible) return null;

  switch (el.type) {
    case 'heading':
      return <RenderHeading el={el} />;
    case 'subheading':
      return <RenderSubheading el={el} />;
    case 'text':
      return <RenderText el={el} />;
    case 'caption':
      return <RenderCaption el={el} />;
    case 'quote':
      return <RenderQuote el={el} />;
    case 'button':
      return <RenderButton el={el} accentColor={accentColor} />;
    case 'image':
    case 'frame':
      return <RenderImage el={el} />;
    case 'divider':
      return <RenderDivider el={el} />;
    case 'contactForm':
    case 'customForm':
      return <RenderContactForm el={el} accentColor={accentColor} />;
    case 'spacer':
      return <div style={{ height: `${el.properties.height || 40}px` }} />;
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Section Renderers
// ---------------------------------------------------------------------------

/** Blank section — renders elements with absolute positioning, scaled to viewport. */
function BlankSection({
  section,
  elements,
  viewport,
  accentColor,
}: {
  section: Section;
  elements: EditorElement[];
  viewport: 'desktop' | 'tablet' | 'mobile';
  accentColor: string;
}) {
  const sectionElements = elements.filter(
    (el) => el.sectionId === section.id && el.visible,
  );

  const bgColor = (section.properties.backgroundColor as string) || 'transparent';
  const bgImage = section.properties.backgroundImage as string | undefined;

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        backgroundColor: bgColor !== 'transparent' ? bgColor : undefined,
        backgroundImage: bgImage ? `url(${bgImage})` : undefined,
        backgroundSize: bgImage ? 'cover' : undefined,
        backgroundPosition: bgImage ? 'center' : undefined,
        minHeight: `${section.height}px`,
      }}
    >
      {/* Responsive scaling container: scale element positions from 1200px canvas to actual width */}
      <div className="relative mx-auto w-full max-w-[1200px]" style={{ minHeight: `${section.height}px` }}>
        {sectionElements.map((el) => {
          const pos = getPosition(el, viewport);
          const fontScale = pos.fontScale || 1;

          // Text-based elements should use auto height so wrapped text
          // is never clipped or overlapped by elements below.
          const isTextElement = [
            'heading', 'subheading', 'text', 'caption', 'quote',
          ].includes(el.type);

          return (
            <div
              key={el.id}
              className="absolute"
              style={{
                left: `${(pos.x / EDITOR_CANVAS_WIDTH) * 100}%`,
                top: `${pos.y}px`,
                width: `${(pos.width / EDITOR_CANVAS_WIDTH) * 100}%`,
                height: isTextElement ? 'auto' : `${pos.height}px`,
                minHeight: isTextElement ? `${pos.height}px` : undefined,
                overflow: isTextElement ? 'visible' : undefined,
                transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
                fontSize: fontScale !== 1 ? `${fontScale}em` : undefined,
              }}
            >
              <RenderElement el={el} accentColor={accentColor} />
            </div>
          );
        })}
      </div>
    </section>
  );
}

/** Booking widget section — links to /book/{subdomain} */
function BookingWidgetSection({
  section,
  subdomain,
  accentColor,
}: {
  section: Section;
  subdomain: string;
  accentColor: string;
}) {
  const heading = (section.properties.heading as string) || 'Book an Appointment';
  const buttonText = (section.properties.buttonText as string) || 'Book Now';
  const sectionAccent = (section.properties.accentColor as string) || accentColor;

  return (
    <section className="w-full py-16 px-4" style={{ backgroundColor: '#f9fafb' }}>
      <div className="max-w-xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{heading}</h2>
        <p className="text-gray-500 mb-8">
          Schedule your next visit with us. Pick a date and time that works best for you.
        </p>
        <a
          href={`/book/${subdomain}`}
          className="inline-block px-8 py-3 rounded-xl text-white font-semibold text-base transition-opacity hover:opacity-90"
          style={{ backgroundColor: sectionAccent }}
        >
          {buttonText}
        </a>
      </div>
    </section>
  );
}

/** Gallery widget section */
function GalleryWidgetSection({
  section,
  accentColor,
}: {
  section: Section;
  accentColor: string;
}) {
  const heading = (section.properties.heading as string) || 'Our Gallery';
  const columns = (section.properties.columns as number) || 3;

  // Generate placeholder images if no actual images are stored
  const placeholders = Array.from({ length: 6 }, (_, i) => ({
    id: `ph-${i}`,
    color: [
      '#E5E7EB', '#D1D5DB', '#F3F4F6', '#E5E7EB', '#D1D5DB', '#F3F4F6',
    ][i],
  }));

  return (
    <section className="w-full py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">{heading}</h2>
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${Math.min(columns, 3)}, 1fr)`,
          }}
        >
          {placeholders.map((ph) => (
            <div
              key={ph.id}
              className="aspect-square rounded-xl flex items-center justify-center"
              style={{ backgroundColor: ph.color }}
            >
              <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 text-center mt-4" style={{ color: accentColor }}>
          Gallery images will appear here
        </p>
      </div>
    </section>
  );
}

/** Review carousel section */
function ReviewCarouselSection({
  section,
}: {
  section: Section;
}) {
  const heading = (section.properties.heading as string) || 'What Our Clients Say';

  const placeholderReviews = [
    { name: 'Happy Customer', text: 'Excellent service and very professional. Would highly recommend!', stars: 5 },
    { name: 'Returning Client', text: 'Always a great experience. The team really knows what they\'re doing.', stars: 5 },
    { name: 'First-Time Visitor', text: 'Welcoming atmosphere and great results. Will definitely be back.', stars: 4 },
  ];

  return (
    <section className="w-full py-16 px-4" style={{ backgroundColor: '#f9fafb' }}>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">{heading}</h2>
        <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
          {placeholderReviews.map((review, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-80 bg-white rounded-2xl p-6 shadow-sm snap-center"
            >
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }, (_, s) => (
                  <svg
                    key={s}
                    className={`w-4 h-4 ${s < review.stars ? 'text-yellow-400' : 'text-gray-200'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">{review.text}</p>
              <p className="text-sm font-semibold text-gray-900">{review.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Service widget section */
function ServiceWidgetSection({
  section,
  subdomain,
  accentColor,
}: {
  section: Section;
  subdomain: string;
  accentColor: string;
}) {
  const heading = (section.properties.heading as string) || 'Book a Service';

  return (
    <section className="w-full py-16 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{heading}</h2>
        <p className="text-gray-500 mb-8">Browse our services and book online.</p>
        <a
          href={`/book/${subdomain}`}
          className="inline-block px-8 py-3 rounded-xl text-white font-semibold text-base transition-opacity hover:opacity-90"
          style={{ backgroundColor: accentColor }}
        >
          View Services
        </a>
      </div>
    </section>
  );
}

/** Product / menu / events / classes widget — generic card layout */
function GenericWidgetSection({
  section,
}: {
  section: Section;
}) {
  const heading = (section.properties.heading as string) || 'Our Offerings';

  return (
    <section className="w-full py-16 px-4">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{heading}</h2>
        <p className="text-gray-500">Content is being prepared. Check back soon.</p>
      </div>
    </section>
  );
}

/** Contact form widget section (standalone) */
function ContactFormWidgetSection({
  section,
  accentColor,
}: {
  section: Section;
  accentColor: string;
}) {
  const heading = (section.properties.heading as string) || 'Get In Touch';
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="w-full py-16 px-4" style={{ backgroundColor: '#f9fafb' }}>
      <div className="max-w-lg mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">{heading}</h2>
        {submitted ? (
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
            <p className="text-gray-700 font-medium">Thank you! We will get back to you soon.</p>
          </div>
        ) : (
          <form
            className="bg-white rounded-2xl p-8 shadow-sm flex flex-col gap-4"
            onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
          >
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-900">Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                placeholder="Your name"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-900">Email <span className="text-red-500">*</span></label>
              <input
                type="email"
                required
                placeholder="your@email.com"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-900">Message <span className="text-red-500">*</span></label>
              <textarea
                required
                rows={4}
                placeholder="How can we help?"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-200"
                style={{ resize: 'vertical' }}
              />
            </div>
            <button
              type="submit"
              className="mt-2 w-full py-2.5 rounded-lg text-white font-semibold text-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: accentColor, border: 'none', cursor: 'pointer' }}
            >
              Send Message
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

/** Map widget section — shows business address */
function MapWidgetSection({
  section,
  businessName,
}: {
  section: Section;
  businessName: string;
}) {
  const address = (section.properties.address as string) || '';

  return (
    <section className="w-full py-16 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Find Us</h2>
        {address ? (
          <p className="text-gray-600 text-lg">{address}</p>
        ) : (
          <p className="text-gray-500">Visit {businessName} — contact us for directions.</p>
        )}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Section Dispatcher
// ---------------------------------------------------------------------------

function RenderSection({
  section,
  elements,
  viewport,
  subdomain,
  businessName,
  accentColor,
}: {
  section: Section;
  elements: EditorElement[];
  viewport: 'desktop' | 'tablet' | 'mobile';
  subdomain: string;
  businessName: string;
  accentColor: string;
}) {
  switch (section.type) {
    case 'blank':
      return (
        <BlankSection
          section={section}
          elements={elements}
          viewport={viewport}
          accentColor={accentColor}
        />
      );
    case 'bookingWidget':
      return (
        <BookingWidgetSection
          section={section}
          subdomain={subdomain}
          accentColor={accentColor}
        />
      );
    case 'serviceWidget':
      return (
        <ServiceWidgetSection
          section={section}
          subdomain={subdomain}
          accentColor={accentColor}
        />
      );
    case 'galleryWidget':
      return (
        <GalleryWidgetSection
          section={section}
          accentColor={accentColor}
        />
      );
    case 'reviewCarousel':
      return <ReviewCarouselSection section={section} />;
    case 'contactForm':
      return (
        <ContactFormWidgetSection
          section={section}
          accentColor={accentColor}
        />
      );
    case 'mapWidget':
      return (
        <MapWidgetSection
          section={section}
          businessName={businessName}
        />
      );
    // Generic fallback for product/menu/events/classes widgets
    case 'productGrid':
    case 'productWidget':
    case 'menuWidget':
    case 'eventsWidget':
    case 'classesWidget':
      return <GenericWidgetSection section={section} />;
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Page Navigation (multi-page support)
// ---------------------------------------------------------------------------

function PageNav({
  pages,
  currentSlug,
  onNavigate,
  businessName,
  accentColor,
}: {
  pages: PageData[];
  currentSlug: string;
  onNavigate: (slug: string) => void;
  businessName: string;
  accentColor: string;
}) {
  if (pages.length <= 1) {
    // Single-page site: just show the business name as a header
    return (
      <header className="w-full border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">{businessName}</span>
        </div>
      </header>
    );
  }

  return (
    <header className="w-full border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <span className="text-lg font-bold text-gray-900">{businessName}</span>
        <nav className="flex gap-1">
          {pages.map((page) => {
            const isActive = page.slug === currentSlug;
            return (
              <button
                key={page.slug}
                type="button"
                onClick={() => onNavigate(page.slug)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: isActive ? accentColor : 'transparent',
                  color: isActive ? '#ffffff' : '#6B7280',
                }}
              >
                {page.title}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function PublicWebsiteRenderer({
  websiteData,
  businessName,
  subdomain,
  colors = {},
}: PublicWebsiteRendererProps) {
  const data = parseSaveData(websiteData);
  const viewport = useViewport();

  const accentColor = resolveColor('buttons', colors, '#3B82F6');
  const bgColor = resolveColor('background', colors, '#ffffff');
  const textColor = resolveColor('text', colors, '#1A1A1A');

  // Multi-page: track current page by slug
  const [currentSlug, setCurrentSlug] = useState<string>(
    data?.pages[0]?.slug || 'home',
  );

  // If the data is invalid or empty, show a minimal fallback
  if (!data || data.pages.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{businessName}</h1>
        <p className="text-gray-500 text-sm">This website is being set up.</p>
      </div>
    );
  }

  const currentPage = data.pages.find((p) => p.slug === currentSlug) || data.pages[0];
  const allElements = data.elements || [];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {/* Navigation */}
      <PageNav
        pages={data.pages}
        currentSlug={currentSlug}
        onNavigate={setCurrentSlug}
        businessName={businessName}
        accentColor={accentColor}
      />

      {/* Page Content */}
      <main className="flex-1">
        {currentPage.sections.map((section) => (
          <RenderSection
            key={section.id}
            section={section}
            elements={allElements}
            viewport={viewport}
            subdomain={subdomain}
            businessName={businessName}
            accentColor={accentColor}
          />
        ))}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-gray-500">{businessName}</p>
          <p className="text-xs text-gray-400">
            Powered by{' '}
            <a
              href="https://redpine.systems"
              className="font-semibold text-gray-500 hover:text-gray-700 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Red Pine
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
