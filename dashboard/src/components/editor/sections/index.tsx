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
    height: section.height,
    overflowY: 'auto',
    backgroundColor: (props.backgroundColor as string) || 'transparent',
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

    default:
      return (
        <div
          className={`flex items-center justify-center ${isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-500'}`}
          style={{ height: section.height || 400 }}
        >
          <p className="text-sm font-['Inter']">{section.type} section</p>
        </div>
      );
  }
}
