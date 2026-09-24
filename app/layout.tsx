import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { CustomerAuthProvider } from "@/components/providers/customer-auth-provider";
import { MobileBottomNav } from "@/components/navigation/mobile-bottom-nav";
import { WhatsAppButton } from "@/components/ui/whatsapp-button";
import { ScrollProgressBar } from "@/components/ui/scroll-progress-bar";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Daranga Villa | Private Luxury Sanctuaries",
  description: "Experience private luxury stays at Daranga Villa.",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/brand/daranga-icon-mark.png", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${cormorant.variable} ${jakarta.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("daranga_theme")||localStorage.getItem("theme");var d=document.documentElement;if(t==="light"||t==="dark"){d.setAttribute("data-theme",t);d.classList.toggle("dark",t==="dark");d.classList.toggle("light",t==="light");d.style.colorScheme=t;}else if(window.matchMedia("(prefers-color-scheme: light)").matches){d.setAttribute("data-theme","light");d.classList.add("light");d.classList.remove("dark");d.style.colorScheme="light";}else{d.setAttribute("data-theme","dark");d.classList.add("dark");d.classList.remove("light");d.style.colorScheme="dark";}}catch(e){}})()`,
          }}
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

