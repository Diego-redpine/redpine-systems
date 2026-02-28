import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Red Pine Widget',
  other: {
    'X-Frame-Options': 'ALLOWALL',
  },
};

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
