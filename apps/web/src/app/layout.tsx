import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mirfa Secure Transactions",
  description: "Envelope encryption demo using AES-256-GCM",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
