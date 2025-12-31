import { TanStackDevtools } from "@tanstack/react-devtools";
import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "LinkBio",
      },
      {
        name: "description",
        content:
          "Create your personalized link page. Share all your links and social media handles in one place.",
      },
      {
        name: "author",
        content: "LinkBio",
      },
      {
        name: "robots",
        content: "index, follow",
      },
      {
        name: "theme-color",
        content: "#000000",
        media: "(prefers-color-scheme: dark)",
      },
      {
        name: "theme-color",
        content: "#ffffff",
        media: "(prefers-color-scheme: light)",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        property: "og:title",
        content: "LinkBio",
      },
      {
        property: "og:description",
        content:
          "Create your personalized link page. Share all your links and social media handles in one place.",
      },
      {
        property: "og:site_name",
        content: "LinkBio",
      },
      {
        property: "og:image",
        content: "/opengraph-image.png",
      },
      {
        property: "twitter:card",
        content: "summary_large_image",
      },
      {
        property: "twitter:title",
        content: "LinkBio",
      },
      {
        property: "twitter:description",
        content:
          "Create your personalized link page. Share all your links and social media handles in one place.",
      },
      {
        property: "twitter:image",
        content: "/opengraph-image.png",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        href: "/logo64.png",
        type: "image/png",
      },
      {
        rel: "apple-touch-icon",
        href: "/logo192.png",
      },
      {
        rel: "manifest",
        href: "/manifest.json",
      },
    ],
  }),

  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  const umamiId =
    process.env.VITE_UMAMI_WEBSITE_ID ?? import.meta.env.VITE_UMAMI_WEBSITE_ID;
  const umamiUrl =
    process.env.VITE_UMAMI_API_URL ?? import.meta.env.VITE_UMAMI_API_URL;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        {umamiId ? (
          <script
            defer
            src={`${umamiUrl}/script.js`}
            data-website-id={umamiId}
            data-auto-track="false"
          ></script>
        ) : null}
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster />
          <TanStackDevtools
            config={{
              position: "bottom-right",
            }}
            plugins={[
              {
                name: "Tanstack Router",
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
          <Scripts />
        </ThemeProvider>
      </body>
    </html>
  );
}
