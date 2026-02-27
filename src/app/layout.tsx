import { DM_Serif_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { Header } from "@/components/header";

const display = DM_Serif_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

const sans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "TicketFlow - Live Events and Tickets",
  description: "Discover and book tickets for concerts and live events.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="min-h-screen font-body antialiased">
        <AuthProvider>
          <Header />
          <main className="pb-20">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
