import type { NextPage } from 'next';
import type { ReactNode } from 'react';

type RootLayoutProps = {
  children: ReactNode;
};

const RootLayout: NextPage<RootLayoutProps> = ({ children }) => {
  return (
    <html lang='en' suppressHydrationWarning>
      <head />
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
