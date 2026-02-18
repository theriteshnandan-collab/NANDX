import type { Metadata, Viewport } from "next";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  metadataBase: new URL("https://danrit.tech"),
  title: "NANDIX — Sovereign Mesh",
  description: "Sovereign P2P communication. No servers. No tracking. Your identity, your rules.",
  manifest: "/manifest.json",
  icons: {
    icon: '/icons/icon.svg',
    apple: '/icons/icon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NANDIX",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { MeshProvider } from "@/context/MeshProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans bg-[var(--background)] text-[var(--foreground)] antialiased`}>
        <MeshProvider>
          {children}
        </MeshProvider>
        <Toaster />
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then(reg => console.log('[SW] Registered:', reg.scope))
                    .catch(err => console.error('[SW] Registration failed:', err));
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
