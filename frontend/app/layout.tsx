import "./globals.css";
import { ReactNode } from "react";
import { ConfigProvider } from "antd";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <ConfigProvider>
          <main className="min-h-screen bg-gray-50 text-gray-900">
            {children}
          </main>
        </ConfigProvider>
      </body>
    </html>
  );
}
