import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ToastProvider";
import { BotPill } from "@/components/BotPill";

export const metadata: Metadata = {
  title: "PFL Event Management",
  description: "Manage Events. Effortlessly.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ background: "#07070f", minHeight: "100vh" }} suppressHydrationWarning>
        <ToastProvider>
          {children}
          <BotPill />
        </ToastProvider>
      </body>
    </html>
  );
}
