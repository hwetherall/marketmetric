import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SimpleAuthProvider } from "./context/SimpleAuthContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "MarketMetric - Market Report Analyzer",
  description: "Score and analyze your market research reports",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SimpleAuthProvider>{children}</SimpleAuthProvider>
      </body>
    </html>
  );
}
