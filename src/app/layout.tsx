import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'StackHard Org | Gestión de Proyectos, Dominios & Finanzas',
  description: 'Panel de control para gestionar landing pages, sistemas, dominios, renovaciones y cobros.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="antialiased bg-slate-950 text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
