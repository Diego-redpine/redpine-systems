/**
 * Custom ChaiBuilder block registrations for Red Pine OS widgets.
 * Call registerCustomBlocks() AFTER loadWebBlocks() in both editor and public rendering.
 */
import { registerChaiBlock, stylesProp } from '@chaibuilder/sdk/runtime';
import { BookingWidget } from '@/components/widgets/BookingWidget';
import { ProductGrid } from '@/components/widgets/ProductGrid';
import { ContactForm } from '@/components/widgets/ContactForm';
import { ReviewCarousel } from '@/components/widgets/ReviewCarousel';
import { GalleryWidget } from '@/components/widgets/GalleryWidget';
import { PortalHeader } from '@/components/widgets/PortalHeader';
import { PortalSchedule } from '@/components/widgets/PortalSchedule';
import { PortalBilling } from '@/components/widgets/PortalBilling';
import { PortalProgress } from '@/components/widgets/PortalProgress';
import { PortalDocuments } from '@/components/widgets/PortalDocuments';
import { PortalAccount } from '@/components/widgets/PortalAccount';
import { PortalAnnouncements } from '@/components/widgets/PortalAnnouncements';
import { PortalShop } from '@/components/widgets/PortalShop';

let registered = false;

export function registerCustomBlocks() {
  if (registered) return;
  registered = true;

  // --- Booking Widget ---
  registerChaiBlock(BookingWidget as never, {
    type: 'BookingWidget',
    label: 'Booking Calendar',
    group: 'Red Pine',
    category: 'core',
    description: 'Appointment booking with date picker, time slots, and confirmation',
    props: {
      schema: {
        properties: {
          styles: stylesProp('w-full'),
          heading: {
            type: 'string',
            title: 'Heading',
            default: 'Book an Appointment',
          },
          buttonText: {
            type: 'string',
            title: 'Button Text',
            default: 'Confirm Booking',
          },
          accentColor: {
            type: 'string',
            title: 'Accent Color',
            default: '#1A1A1A',
          },
          linkedServiceId: {
            type: 'string',
            title: 'Linked Service ID',
            default: '',
          },
          linkedServiceName: {
            type: 'string',
            title: 'Linked Service Name',
            default: '',
          },
        },
      },
      uiSchema: {
        linkedServiceId: { 'ui:widget': 'hidden' },
        linkedServiceName: { 'ui:widget': 'hidden' },
      },
    },
    i18nProps: ['heading', 'buttonText'],
    aiProps: ['heading', 'buttonText', 'accentColor'],
  });

  // --- Product / Service Grid ---
  registerChaiBlock(ProductGrid as never, {
    type: 'ProductGrid',
    label: 'Product / Service Grid',
    group: 'Red Pine',
    category: 'core',
    description: 'Grid of products or services with prices and booking button',
    props: {
      schema: {
        properties: {
          styles: stylesProp('w-full'),
          heading: {
            type: 'string',
            title: 'Heading',
            default: 'Our Services',
          },
          columns: {
            type: 'number',
            title: 'Columns',
            default: 3,
            enum: [2, 3, 4],
            enumNames: ['2 Columns', '3 Columns', '4 Columns'],
          },
          showPrice: {
            type: 'boolean',
            title: 'Show Prices',
            default: true,
          },
          accentColor: {
            type: 'string',
            title: 'Accent Color',
            default: '#1A1A1A',
          },
          linkedProductId: {
            type: 'string',
            title: 'Linked Product ID',
            default: '',
          },
          linkedProductName: {
            type: 'string',
            title: 'Linked Product Name',
            default: '',
          },
        },
      },
      uiSchema: {
        linkedProductId: { 'ui:widget': 'hidden' },
        linkedProductName: { 'ui:widget': 'hidden' },
      },
    },
    i18nProps: ['heading'],
    aiProps: ['heading', 'columns', 'showPrice', 'accentColor'],
  });

  // --- Contact Form ---
  registerChaiBlock(ContactForm as never, {
    type: 'ContactForm',
    label: 'Contact Form',
    group: 'Red Pine',
    category: 'core',
    description: 'Contact form with name, email, phone, and message fields',
    props: {
      schema: {
        properties: {
          styles: stylesProp('w-full'),
          heading: {
            type: 'string',
            title: 'Heading',
            default: 'Get in Touch',
          },
          description: {
            type: 'string',
            title: 'Description',
            default: "Fill out the form below and we'll get back to you shortly.",
          },
          submitText: {
            type: 'string',
            title: 'Submit Button Text',
            default: 'Send Message',
          },
          showPhone: {
            type: 'boolean',
            title: 'Show Phone Field',
            default: true,
          },
          accentColor: {
            type: 'string',
            title: 'Accent Color',
            default: '#1A1A1A',
          },
          linkedFormId: {
            type: 'string',
            title: 'Linked Form ID',
            default: '',
          },
          linkedFormName: {
            type: 'string',
            title: 'Linked Form Name',
            default: '',
          },
        },
      },
      uiSchema: {
        linkedFormId: { 'ui:widget': 'hidden' },
        linkedFormName: { 'ui:widget': 'hidden' },
      },
    },
    i18nProps: ['heading', 'description', 'submitText'],
    aiProps: ['heading', 'description', 'submitText', 'accentColor'],
  });

  // --- Review Carousel ---
  registerChaiBlock(ReviewCarousel as never, {
    type: 'ReviewCarousel',
    label: 'Review Carousel',
    group: 'Red Pine',
    category: 'core',
    description: 'Customer review carousel with star ratings and auto-play',
    props: {
      schema: {
        properties: {
          styles: stylesProp('w-full'),
          heading: {
            type: 'string',
            title: 'Heading',
            default: 'What Our Clients Say',
          },
          autoPlay: {
            type: 'boolean',
            title: 'Auto-play',
            default: true,
          },
          accentColor: {
            type: 'string',
            title: 'Accent Color',
            default: '#1A1A1A',
          },
          linkedReviewId: {
            type: 'string',
            title: 'Linked Review Source ID',
            default: '',
          },
          linkedReviewName: {
            type: 'string',
            title: 'Linked Review Source Name',
            default: '',
          },
        },
      },
      uiSchema: {
        linkedReviewId: { 'ui:widget': 'hidden' },
        linkedReviewName: { 'ui:widget': 'hidden' },
      },
    },
    i18nProps: ['heading'],
    aiProps: ['heading', 'accentColor'],
  });

  // --- Gallery Widget ---
  registerChaiBlock(GalleryWidget as never, {
    type: 'GalleryWidget',
    label: 'Photo Gallery',
    group: 'Red Pine',
    category: 'core',
    description: 'Photo gallery with albums view, masonry layout, and lightbox',
    props: {
      schema: {
        properties: {
          styles: stylesProp('w-full'),
          heading: {
            type: 'string',
            title: 'Heading',
            default: 'Our Gallery',
          },
          viewMode: {
            type: 'string',
            title: 'View Mode',
            default: 'gallery',
            enum: ['albums', 'gallery'],
          },
          layout: {
            type: 'string',
            title: 'Layout',
            default: 'masonry',
            enum: ['grid', 'masonry'],
          },
          columns: {
            type: 'number',
            title: 'Columns',
            default: 3,
            enum: [2, 3, 4],
          },
          showCaptions: {
            type: 'boolean',
            title: 'Show Captions',
            default: true,
          },
          lightbox: {
            type: 'boolean',
            title: 'Lightbox on Click',
            default: true,
          },
          maxPhotos: {
            type: 'number',
            title: 'Max Photos',
            default: 0,
            enum: [6, 12, 0],
          },
          accentColor: {
            type: 'string',
            title: 'Accent Color',
            default: '#1A1A1A',
          },
          linkedGalleryId: {
            type: 'string',
            title: 'Linked Gallery ID',
            default: '',
          },
          linkedGalleryName: {
            type: 'string',
            title: 'Linked Gallery Name',
            default: '',
          },
        },
      },
      uiSchema: {
        linkedGalleryId: { 'ui:widget': 'hidden' },
        linkedGalleryName: { 'ui:widget': 'hidden' },
      },
    },
    i18nProps: ['heading'],
    aiProps: ['heading', 'viewMode', 'layout', 'columns', 'showCaptions', 'accentColor'],
  });

  // ==============================
  // RED PINE PORTAL WIDGETS
  // ==============================

  // --- Portal Header ---
  registerChaiBlock(PortalHeader as never, {
    type: 'PortalHeader',
    label: 'Portal Header',
    group: 'Red Pine Portal',
    category: 'core',
    description: 'Welcome header with student switcher for multi-student portals',
    props: {
      schema: {
        properties: {
          styles: stylesProp('w-full'),
          heading: { type: 'string', title: 'Greeting', default: 'Welcome back' },
          accentColor: { type: 'string', title: 'Accent Color', default: '#1A1A1A' },
          showLogo: { type: 'boolean', title: 'Show Logo', default: true },
        },
      },
      uiSchema: {},
    },
    i18nProps: ['heading'],
    aiProps: ['heading', 'accentColor'],
  });

  // --- Portal Schedule ---
  registerChaiBlock(PortalSchedule as never, {
    type: 'PortalSchedule',
    label: 'Portal Schedule',
    group: 'Red Pine Portal',
    category: 'core',
    description: 'Schedule view with class registration and upcoming/registered tabs',
    props: {
      schema: {
        properties: {
          styles: stylesProp('w-full'),
          heading: { type: 'string', title: 'Heading', default: 'My Schedule' },
          accentColor: { type: 'string', title: 'Accent Color', default: '#1A1A1A' },
          allowRegistration: { type: 'boolean', title: 'Allow Registration', default: true },
        },
      },
      uiSchema: {},
    },
    i18nProps: ['heading'],
    aiProps: ['heading', 'accentColor'],
  });

  // --- Portal Billing ---
  registerChaiBlock(PortalBilling as never, {
    type: 'PortalBilling',
    label: 'Portal Billing',
    group: 'Red Pine Portal',
    category: 'core',
    description: 'Invoice list with outstanding balance card and pay button',
    props: {
      schema: {
        properties: {
          styles: stylesProp('w-full'),
          heading: { type: 'string', title: 'Heading', default: 'Billing & Payments' },
          accentColor: { type: 'string', title: 'Accent Color', default: '#1A1A1A' },
          showPayButton: { type: 'boolean', title: 'Show Pay Button', default: true },
        },
      },
      uiSchema: {},
    },
    i18nProps: ['heading'],
    aiProps: ['heading', 'accentColor'],
  });

  // --- Portal Progress ---
  registerChaiBlock(PortalProgress as never, {
    type: 'PortalProgress',
    label: 'Portal Progress',
    group: 'Red Pine Portal',
    category: 'core',
    description: 'Belt/tier/level progression timeline with current rank display',
    props: {
      schema: {
        properties: {
          styles: stylesProp('w-full'),
          heading: { type: 'string', title: 'Heading', default: 'My Progress' },
          accentColor: { type: 'string', title: 'Accent Color', default: '#1A1A1A' },
          progressType: {
            type: 'string', title: 'Progress Type', default: 'belt',
            enum: ['belt', 'tier', 'level'],
            enumNames: ['Belt System', 'Tier System', 'Level System'],
          },
        },
      },
      uiSchema: {},
    },
    i18nProps: ['heading'],
    aiProps: ['heading', 'accentColor', 'progressType'],
  });

  // --- Portal Documents ---
  registerChaiBlock(PortalDocuments as never, {
    type: 'PortalDocuments',
    label: 'Portal Documents',
    group: 'Red Pine Portal',
    category: 'core',
    description: 'Document list with digital waiver signing via signature pad',
    props: {
      schema: {
        properties: {
          styles: stylesProp('w-full'),
          heading: { type: 'string', title: 'Heading', default: 'Documents & Waivers' },
          accentColor: { type: 'string', title: 'Accent Color', default: '#1A1A1A' },
          allowSigning: { type: 'boolean', title: 'Allow Digital Signing', default: true },
        },
      },
      uiSchema: {},
    },
    i18nProps: ['heading'],
    aiProps: ['heading', 'accentColor'],
  });

  // --- Portal Account ---
  registerChaiBlock(PortalAccount as never, {
    type: 'PortalAccount',
    label: 'Portal Account',
    group: 'Red Pine Portal',
    category: 'core',
    description: 'Client profile with editable contact and emergency info',
    props: {
      schema: {
        properties: {
          styles: stylesProp('w-full'),
          heading: { type: 'string', title: 'Heading', default: 'My Account' },
          accentColor: { type: 'string', title: 'Accent Color', default: '#1A1A1A' },
        },
      },
      uiSchema: {},
    },
    i18nProps: ['heading'],
    aiProps: ['heading', 'accentColor'],
  });

  // --- Portal Announcements ---
  registerChaiBlock(PortalAnnouncements as never, {
    type: 'PortalAnnouncements',
    label: 'Portal Announcements',
    group: 'Red Pine Portal',
    category: 'core',
    description: 'News, tournaments, events, and closure announcements',
    props: {
      schema: {
        properties: {
          styles: stylesProp('w-full'),
          heading: { type: 'string', title: 'Heading', default: 'News & Events' },
          accentColor: { type: 'string', title: 'Accent Color', default: '#1A1A1A' },
        },
      },
      uiSchema: {},
    },
    i18nProps: ['heading'],
    aiProps: ['heading', 'accentColor'],
  });

  // --- Portal Shop ---
  registerChaiBlock(PortalShop as never, {
    type: 'PortalShop',
    label: 'Portal Shop',
    group: 'Red Pine Portal',
    category: 'core',
    description: 'Product shop with upgrades/testing prioritized above merchandise',
    props: {
      schema: {
        properties: {
          styles: stylesProp('w-full'),
          heading: { type: 'string', title: 'Heading', default: 'Shop' },
          accentColor: { type: 'string', title: 'Accent Color', default: '#1A1A1A' },
        },
      },
      uiSchema: {},
    },
    i18nProps: ['heading'],
    aiProps: ['heading', 'accentColor'],
  });
}
