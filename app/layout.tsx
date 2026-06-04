import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tell me about...",
  description: "AI-powered news briefings",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" style={{ height: "100%" }}>
      <body style={{ margin: 0, padding: 0, height: "100%" }}>
        <style>{`input::placeholder { color: #bbb; }`}</style>
        {children}
      </body>
    </html>
  );
}
