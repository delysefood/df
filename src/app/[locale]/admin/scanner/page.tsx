'use client';

import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Loader2, ScanLine } from 'lucide-react';

export default function ScannerPage() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Only initialize scanner on client
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(
      (decodedText) => {
        setScanResult(decodedText);
        scanner.clear();
        router.push(`/admin/orders/${decodedText}`);
      },
      (err) => {
        // Ignore scan errors, happens when no QR found in frame
      }
    );

    return () => {
      scanner.clear().catch((error) => console.error('Failed to clear scanner.', error));
    };
  }, [router]);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-foreground uppercase tracking-widest flex items-center gap-3">
          <ScanLine className="text-gold" size={32} />
          Scanner QR
        </h1>
        <p className="text-foreground/60 mt-2 font-medium">
          Scannez le code QR présenté par le client pour accéder directement à sa commande.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-[2.5rem] p-8 border border-border"
      >
        {scanResult ? (
          <div className="text-center py-12 space-y-4">
            <Loader2 className="animate-spin text-gold mx-auto" size={48} />
            <p className="text-foreground/80 font-black uppercase tracking-widest text-sm">
              Redirection vers la commande...
            </p>
            <p className="text-foreground/50 text-xs">{scanResult}</p>
          </div>
        ) : (
          <div className="scanner-container">
            <div id="qr-reader" className="w-full overflow-hidden rounded-2xl bg-black/50 border border-border min-h-[300px]"></div>
          </div>
        )}
      </motion.div>

      {/* Basic styles to override the ugly default html5-qrcode styles */}
      <style dangerouslySetInnerHTML={{__html: `
        #qr-reader {
          border: none !important;
          border-radius: 1rem !important;
        }
        #qr-reader__scan_region {
          background: transparent !important;
        }
        #qr-reader__dashboard {
          padding: 1rem !important;
          background: #141414 !important;
          border-top: 1px solid #333 !important;
        }
        #qr-reader button {
          background-color: #C5A059 !important;
          color: white !important;
          border: none !important;
          padding: 0.5rem 1rem !important;
          border-radius: 0.5rem !important;
          font-weight: bold !important;
          cursor: pointer !important;
          text-transform: uppercase !important;
          font-size: 10px !important;
          letter-spacing: 1px !important;
        }
        #qr-reader select {
          background-color: #000 !important;
          color: white !important;
          border: 1px solid #333 !important;
          padding: 0.5rem !important;
          border-radius: 0.5rem !important;
          margin-bottom: 1rem !important;
        }
        #qr-reader a {
          display: none !important;
        }
      `}} />
    </div>
  );
}
