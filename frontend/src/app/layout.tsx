import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CleanCity AI | Smart Waste Management',
  description: 'AI-powered geo-mapped waste reporting and cleanup platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
