import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import "../globals.css";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/context/AuthProvider';
import { CartProvider } from '@/context/CartContext';
import { ThemeProvider } from '@/context/ThemeContext';
import CustomCursor from '@/components/animations/CustomCursor';

export const metadata = {
  title: "Delyse Food | Restaurant Premium",
  description: "Experience gastronomique d'exception",
};

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <body className="antialiased selection:bg-gold selection:text-white flex flex-col min-h-screen font-sans">
        <CustomCursor />
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <NextIntlClientProvider messages={messages}>
                <Navbar />
                <main className="flex-grow">
                  {children}
                </main>
                <Footer />
              </NextIntlClientProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
