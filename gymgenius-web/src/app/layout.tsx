import './globals.css';
import React from 'react';

export const metadata = {
  title: 'GymGenius Web',
  description: 'AI-Powered Fitness Platform',
};

export default function RootLayout({
                                     children,
                                   }: {
  children: React.ReactNode;
}) {
  return (
      <html lang="it" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen">
      {children}
      </body>
      </html>
  );
}