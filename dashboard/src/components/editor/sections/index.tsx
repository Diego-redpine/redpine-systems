export { default as BlankSection } from './BlankSection';

import { BookingWidget } from '@/components/widgets/BookingWidget';
import { GalleryWidget } from '@/components/widgets/GalleryWidget';
import { ProductGrid } from '@/components/widgets/ProductGrid';
import { ReviewCarousel } from '@/components/widgets/ReviewCarousel';

interface SectionRendererProps {
  section: { id: string; type: string; height: number; properties: Record<string, unknown> };
  viewportWidth: number;
  theme?: 'dark' | 'light';
  accentColor?: string;
}

export function SectionRenderer({ section, theme = 'dark', accentColor = '#E11D48' }: SectionRendererProps) {
  const isDark = theme === 'dark';
  const props = section.properties || {};

  switch (section.type) {
    case 'bookingWidget':
      return (
        <div className="w-full overflow-hidden" style={{ height: section.height, backgroundColor: (props.backgroundColor as string) || 'transparent' }}>
          <BookingWidget
            blockProps={{}}
            inBuilder={true}
            heading={(props.heading as string) || 'Book an Appointment'}
            buttonText={(props.buttonText as string) || 'Book Now'}
            accentColor={(props.accentColor as string) || '#1A1A1A'}
          />
        </div>
      );

    case 'galleryWidget':
      return (
        <div className="w-full overflow-hidden" style={{ height: section.height, backgroundColor: (props.backgroundColor as string) || 'transparent' }}>
          <GalleryWidget
            blockProps={{}}
            inBuilder={true}
            heading={(props.heading as string) || 'Our Gallery'}
            viewMode={(props.viewMode as string) || 'gallery'}
            layout={(props.layout as string) || 'masonry'}
            columns={(props.columns as number) || 3}
            showCaptions={(props.showCaptions as boolean) ?? true}
            lightbox={(props.lightbox as boolean) ?? true}
            maxPhotos={(props.maxPhotos as number) || 9}
            accentColor={(props.accentColor as string) || '#1A1A1A'}
          />
        </div>
      );

    case 'productGrid':
      return (
        <div className="w-full overflow-hidden" style={{ height: section.height, backgroundColor: (props.backgroundColor as string) || 'transparent' }}>
          <ProductGrid
            blockProps={{}}
            inBuilder={true}
            heading={(props.heading as string) || 'Our Services'}
            columns={(props.columns as number) || 3}
            showPrice={(props.showPrice as boolean) ?? true}
            accentColor={(props.accentColor as string) || '#1A1A1A'}
          />
        </div>
      );

    case 'reviewCarousel':
      return (
        <div className="w-full overflow-hidden" style={{ height: section.height, backgroundColor: (props.backgroundColor as string) || 'transparent' }}>
          <ReviewCarousel
            blockProps={{}}
            inBuilder={true}
            heading={(props.heading as string) || 'What Our Clients Say'}
            autoPlay={(props.autoPlay as boolean) ?? true}
            accentColor={(props.accentColor as string) || '#1A1A1A'}
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
