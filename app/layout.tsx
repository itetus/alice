import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Alice Lima | Festa de 12 Anos",
  description: "Convite digital para a festa de 12 anos da Alice Lima.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
