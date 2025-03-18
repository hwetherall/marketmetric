import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SimpleAuthProvider } from "./context/SimpleAuthContext";

// Load Inter font with slightly heavier default weights for better visibility
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ['400', '500', '600', '700', '800'], // Include medium to extra-bold weights
  display: 'swap', // Ensures text remains visible during font loading
});

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
      <body className={`${inter.className} antialiased`}>
        <SimpleAuthProvider>{children}</SimpleAuthProvider>
      </body>
    </html>
  );
}
