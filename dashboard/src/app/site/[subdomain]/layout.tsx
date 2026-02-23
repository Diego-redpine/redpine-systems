/**
 * Layout for public website routes (/site/[subdomain]).
 *
 * The root layout sets overflow:hidden on html/body because the dashboard
 * needs a fixed sidebar with no page-level scroll. Public websites, however,
 * are normal scrollable pages. This layout injects a style tag to undo the
 * root layout's overflow:hidden specifically for /site/* routes.
 */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Override the root layout's overflow:hidden so the public site scrolls */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            html, body {
              overflow: auto !important;
              height: auto !important;
              min-height: 100vh;
            }
          `,
        }}
      />
      {children}
    </>
  );
}
