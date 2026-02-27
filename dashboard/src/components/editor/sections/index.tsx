export { default as BlankSection } from './BlankSection';

import { BookingWidget } from '@/components/widgets/BookingWidget';
import { ServiceWidget } from '@/components/widgets/ServiceWidget';
import { GalleryWidget } from '@/components/widgets/GalleryWidget';
import { ProductGrid } from '@/components/widgets/ProductGrid';
import { ProductWidget } from '@/components/widgets/ProductWidget';
import { MenuWidget } from '@/components/widgets/MenuWidget';
import { EventsWidget } from '@/components/widgets/EventsWidget';
import { ClassesWidget } from '@/components/widgets/ClassesWidget';
import { ReviewCarousel } from '@/components/widgets/ReviewCarousel';
import { BlogWidget } from '@/components/widgets/BlogWidget';

interface SectionRendererProps {
  section: { id: string; type: string; height: number; properties: Record<string, unknown> };
  viewportWidth: number;
  theme?: 'dark' | 'light';
  accentColor?: string;
}

export function SectionRenderer({ section, viewportWidth, theme = 'dark', accentColor = '#E11D48' }: SectionRendererProps) {
  const isDark = theme === 'dark';
  const props = section.properties || {};
  // Widgets inherit the editor's brand accentColor unless the section has its own override
  const widgetAccent = (props.accentColor as string) || accentColor;
  const isMobile = viewportWidth < 480;

  const wrapStyle: React.CSSProperties = {
    width: '100%',
    minHeight: section.height,
    height: '100%',
    overflowY: 'auto',
    backgroundColor: (props.backgroundColor as string) || 'transparent',
    display: 'flex',
    flexDirection: 'column',
  };

  switch (section.type) {
    case 'serviceWidget':
      return (
        <div style={wrapStyle}>
          <ServiceWidget
            blockProps={{}}
            inBuilder={true}
            heading={(props.heading as string) || 'Book a Service'}
            showCategories={(props.showCategories as boolean) ?? true}
            showPrices={(props.showPrices as boolean) ?? true}
            showDurations={(props.showDurations as boolean) ?? true}
            accentColor={widgetAccent}
            viewportWidth={viewportWidth}
            sectionHeight={section.height}
          />
        </div>
      );

    case 'bookingWidget':
      return (
        <div style={wrapStyle}>
          <BookingWidget
            blockProps={{}}
            inBuilder={true}
            heading={(props.heading as string) || 'Book an Appointment'}
            buttonText={(props.buttonText as string) || 'Book Now'}
            accentColor={widgetAccent}
          />
        </div>
      );

    case 'galleryWidget':
      return (
        <div style={wrapStyle}>
          <GalleryWidget
            blockProps={{}}
            inBuilder={true}
            heading={(props.heading as string) || 'Our Gallery'}
            viewMode={(props.viewMode as string) || 'gallery'}
            layout={(props.layout as string) || 'masonry'}
            columns={isMobile ? 2 : (props.columns as number) || 3}
            showCaptions={(props.showCaptions as boolean) ?? true}
            lightbox={(props.lightbox as boolean) ?? true}
            maxPhotos={(props.maxPhotos as number) || 9}
            accentColor={widgetAccent}
            sectionHeight={section.height}
          />
        </div>
      );

    case 'productGrid':
      return (
        <div style={wrapStyle}>
          <ProductGrid
            blockProps={{}}
            inBuilder={true}
            heading={(props.heading as string) || 'Our Services'}
            columns={isMobile ? 1 : (props.columns as number) || 3}
            showPrice={(props.showPrice as boolean) ?? true}
            accentColor={widgetAccent}
            sectionHeight={section.height}
          />
        </div>
      );

    case 'productWidget':
      return (
        <div style={wrapStyle}>
          <ProductWidget
            blockProps={{}}
            inBuilder={true}
            heading={(props.heading as string) || 'Our Products'}
            columns={isMobile ? 1 : (props.columns as number) || 3}
            showPrice={(props.showPrice as boolean) ?? true}
            showDescription={(props.showDescription as boolean) ?? true}
            accentColor={widgetAccent}
            viewportWidth={viewportWidth}
            sectionHeight={section.height}
          />
        </div>
      );

    case 'menuWidget':
      return (
        <div style={wrapStyle}>
          <MenuWidget
            blockProps={{}}
            inBuilder={true}
            heading={(props.heading as string) || 'Our Menu'}
            showAllergens={(props.showAllergens as boolean) ?? true}
            showImages={(props.showImages as boolean) ?? true}
            accentColor={widgetAccent}
            viewportWidth={viewportWidth}
          />
        </div>
      );

    case 'eventsWidget':
      return (
        <div style={wrapStyle}>
          <EventsWidget
            blockProps={{}}
            inBuilder={true}
            heading={(props.heading as string) || 'Upcoming Events'}
            showCapacity={(props.showCapacity as boolean) ?? true}
            accentColor={widgetAccent}
            viewportWidth={viewportWidth}
          />
        </div>
      );

    case 'classesWidget':
      return (
        <div style={wrapStyle}>
          <ClassesWidget
            blockProps={{}}
            inBuilder={true}
            heading={(props.heading as string) || 'Class Schedule'}
            showInstructor={(props.showInstructor as boolean) ?? true}
            showPrice={(props.showPrice as boolean) ?? true}
            accentColor={widgetAccent}
            viewportWidth={viewportWidth}
            sectionHeight={section.height}
          />
        </div>
      );

    case 'reviewCarousel':
      return (
        <div style={wrapStyle}>
          <ReviewCarousel
            blockProps={{}}
            inBuilder={true}
            heading={(props.heading as string) || 'What Our Clients Say'}
            autoPlay={(props.autoPlay as boolean) ?? true}
            accentColor={widgetAccent}
          />
        </div>
      );

    case 'blogWidget':
      return (
        <div style={wrapStyle}>
          <BlogWidget
            blockProps={{}}
            inBuilder={true}
            heading={(props.heading as string) || 'Our Blog'}
            columns={isMobile ? 1 : (props.columns as number) || 3}
            accentColor={widgetAccent}
            viewportWidth={viewportWidth}
            sectionHeight={section.height}
          />
        </div>
      );

    case 'faqWidget': {
      const faqItems = [
        { q: 'What services do you offer?', a: 'We offer a wide range of services tailored to your needs. Contact us to learn more.' },
        { q: 'How do I book an appointment?', a: 'You can book directly through our website or give us a call.' },
        { q: 'What are your hours?', a: 'We\'re open Monday through Saturday. Check our booking page for available times.' },
        { q: 'Do you offer gift cards?', a: 'Yes! Gift cards are available in any amount.' },
      ];
      return (
        <div style={wrapStyle}>
          <div className="w-full max-w-3xl mx-auto px-6 py-8">
            <h2 className="text-2xl font-bold text-center mb-8" style={{ color: isDark ? '#fff' : '#1A1A1A' }}>
              {(props.heading as string) || 'Frequently Asked Questions'}
            </h2>
            <div className="space-y-3">
              {faqItems.map((item, i) => (
                <div key={i} className={`border rounded-lg p-4 ${isDark ? 'border-zinc-700 bg-zinc-800/50' : 'border-zinc-200 bg-white'}`}>
                  <div className="flex items-center justify-between">
                    <span className={`font-medium text-sm ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>{item.q}</span>
                    <span className={`text-lg ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>+</span>
                  </div>
                  <p className={`text-sm mt-2 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    default:
      return (
        <div
          className={`flex items-center justify-center ${isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-500'}`}
          style={{ minHeight: section.height || 400, height: '100%' }}
        >
          <p className="text-sm font-['Inter']">{section.type} section</p>
        </div>
      );
  }
}
