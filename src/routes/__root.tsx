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
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
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
