import type { Metadata } from 'next';
import { AuthProvider } from '@/providers/AuthProvider';
import { SocketProvider } from '@/providers/SocketProvider';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Vortex',
    template: '%s | Vortex',
  },
  description: 'Vortex — Event-Driven E-Commerce Ecosystem',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>
          <SocketProvider>{children}</SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
