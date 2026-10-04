import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { CustomerAuthProvider } from "@/components/providers/customer-auth-provider";
import { MobileBottomNav } from "@/components/navigation/mobile-bottom-nav";
import { WhatsAppButton } from "@/components/ui/whatsapp-button";
import { ScrollProgressBar } from "@/components/ui/scroll-progress-bar";
import { getSiteUrl, getCanonicalUrl, generateOrganizationSchema, generateWebSiteSchema } from "@/lib/seo";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Daranga Villas | Luxury Private Villas in Udaipur",
    template: "%s | Daranga Villas",
  },
  description:
    "Discover private luxury villas in Udaipur for exclusive group getaways, family holidays, and weekend retreats featuring private pools and personalized hospitality.",
  keywords: [
    "Daranga Villas",
    "luxury villas Udaipur",
    "private villa with pool Udaipur",
    "villas in Udaipur",
    "weekend getaway Udaipur",
    "group stays Udaipur",
  ],
  authors: [{ name: "Daranga Villas" }],
  creator: "Daranga Villas",
  publisher: "Daranga Villas",
  alternates: {
    canonical: getCanonicalUrl("/"),
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "Daranga Villas",
    title: "Daranga Villas | Luxury Private Villas in Udaipur",
    description:
      "Discover private luxury villas in Udaipur for exclusive group getaways, family holidays, and weekend retreats with private pools.",
    images: [
      {
        url: `${siteUrl}/images/hero/heroimg.webp`,
        width: 1200,
        height: 630,
        alt: "Daranga Villas Luxury Private Villas in Udaipur",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Daranga Villas | Luxury Private Villas in Udaipur",
    description:
      "Discover private luxury villas in Udaipur for exclusive group getaways, family holidays, and weekend retreats.",
    images: [`${siteUrl}/images/hero/heroimg.webp`],
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/brand/daranga-icon-mark.png", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const orgSchema = generateOrganizationSchema();
  const websiteSchema = generateWebSiteSchema();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("daranga_theme")||localStorage.getItem("theme");var d=document.documentElement;if(t==="light"||t==="dark"){d.setAttribute("data-theme",t);d.classList.toggle("dark",t==="dark");d.classList.toggle("light",t==="light");d.style.colorScheme=t;}else if(window.matchMedia("(prefers-color-scheme: dark)").matches){d.setAttribute("data-theme","dark");d.classList.add("dark");d.classList.remove("light");d.style.colorScheme="dark";}else{d.setAttribute("data-theme","light");d.classList.add("light");d.classList.remove("dark");d.style.colorScheme="light";}}catch(e){}})()`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] selection:bg-[var(--accent)] selection:text-[var(--bg-primary)]">
        <ScrollProgressBar />
        <ThemeProvider>
          <CustomerAuthProvider>
            {children}
            <WhatsAppButton />
            <MobileBottomNav />
          </CustomerAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}


