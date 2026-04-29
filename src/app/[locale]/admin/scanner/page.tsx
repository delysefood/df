'use client';

import { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ScanLine, ExternalLink, Package, MapPin, Loader2, CheckCircle2 } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function ScannerPage() {
  const t = useTranslations('Admin');
  const locale = useLocale();
  const [scannedOrders, setScannedOrders] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('scannedOrders');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return [];
  });
  
  const [isScanningState, setIsScanningState] = useState(false);
  const isScanningRef = useRef(false);
  const scannedIdsRef = useRef<Set<string>>(new Set());

  // Initialize refs from loaded state on first render
  if (scannedIdsRef.current.size === 0 && scannedOrders.length > 0) {
    scannedIdsRef.current = new Set(scannedOrders.map(o => o._id));
  }

  // Save to session storage when updated
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('scannedOrders', JSON.stringify(scannedOrders));
    }
  }, [scannedOrders]);

  // Refresh statuses from backend to keep them up to date when returning to this page
  useEffect(() => {
    const refreshStatuses = async () => {
      if (scannedOrders.length === 0) return;
      try {
        const res = await fetch('/api/admin/orders');
        if (res.ok) {
          const allOrders = await res.json();
          setScannedOrders(prev => {
            let hasChanges = false;
            // Filter out orders that no longer exist
            const filtered = prev.filter(order => allOrders.some((o: any) => o._id === order._id));
            if (filtered.length !== prev.length) hasChanges = true;

            const updated = filtered.map(order => {
              const freshOrder = allOrders.find((o: any) => o._id === order._id);
              if (freshOrder && freshOrder.status !== order.status) {
                hasChanges = true;
                return { ...order, status: freshOrder.status };
              }
              return order;
            });
            return hasChanges ? updated : prev;
          });
        }
      } catch (err) {
        console.error("Failed to refresh statuses", err);
      }
    };

    refreshStatuses();
    
    // Optional: Auto-refresh every 15 seconds while on this page
    const interval = setInterval(refreshStatuses, 15000);
    return () => clearInterval(interval);
  }, []); // Run on mount

  useEffect(() => {
    // Only initialize scanner on client
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(
      async (decodedText) => {
        // Prevent multiple simultaneous scans or re-scanning the same code
        if (scannedIdsRef.current.has(decodedText) || isScanningRef.current) return;
        
        isScanningRef.current = true;
        setIsScanningState(true);
        
        // Optimistically add to set to prevent concurrent fires before fetch completes
        scannedIdsRef.current.add(decodedText);
        
        try {
          const res = await fetch(`/api/admin/orders/scan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: decodedText })
          });
          
          const data = await res.json();
          
          // Silently add to list whether it was just scanned or previously scanned
          if ((res.ok && data.success) || (res.status === 400 && data.alreadyScanned)) {
            setScannedOrders(prev => [data.order, ...prev]);
          } else {
            // Only alert for real errors (not found, etc.)
            scannedIdsRef.current.delete(decodedText); // Allow re-scanning if error
          }
        } catch (error) {
          console.error(error);
          scannedIdsRef.current.delete(decodedText);
        } finally {
          setTimeout(() => {
            isScanningRef.current = false;
            setIsScanningState(false);
          }, 1500);
        }
      },
      (err) => {
        // Ignore scan errors, happens when no QR found in frame
      }
    );

    return () => {
      scanner.clear().catch((error) => console.error('Failed to clear scanner.', error));
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-foreground uppercase tracking-widest flex items-center gap-3">
          <ScanLine className="text-gold" size={32} />
          {t('scanner')}
        </h1>
        <p className="text-foreground/60 mt-2 font-medium">
          {t('scannerDesc')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Scanner Area */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card rounded-[2.5rem] p-8 border border-border h-fit"
        >
          <div className="scanner-container relative">
            {isScanningState && (
              <div className="absolute inset-0 bg-black/60 z-10 rounded-2xl flex items-center justify-center">
                 <Loader2 className="animate-spin text-gold" size={48} />
              </div>
            )}
            <div id="qr-reader" className="w-full overflow-hidden rounded-2xl bg-black/50 border border-border min-h-[300px]"></div>
          </div>
        </motion.div>

        {/* Scanned List Area */}
        <div className="space-y-4">
          <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
            {t('scannedOrders')} <span className="text-gold">({scannedOrders.length})</span>
          </h2>
          
          <div className="space-y-4">
            <AnimatePresence>
              {scannedOrders.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="p-8 text-center text-foreground/30 border border-dashed border-border rounded-3xl"
                >
                  <ScanLine size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="text-xs uppercase tracking-widest font-black">{t('noScannedOrders')}</p>
                </motion.div>
              ) : (
                Object.entries(
                  scannedOrders.reduce((acc, order) => {
                    const dateStr = new Date(order.createdAt || Date.now()).toLocaleDateString(locale === 'fr' ? 'fr-FR' : locale === 'ar' ? 'ar-SA' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' });
                    if (!acc[dateStr]) acc[dateStr] = [];
                    acc[dateStr].push(order);
                    return acc;
                  }, {} as Record<string, any[]>)
                ).map(([dateLabel, ordersForDate]) => (
                  <div key={dateLabel} className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gold border-b border-gold/10 pb-2 capitalize">
                      {dateLabel}
                    </h3>
                    {(ordersForDate as any[]).map((order) => (
                      <motion.div 
                        key={order._id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card p-6 rounded-3xl border border-border relative overflow-hidden"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="flex items-center gap-3">
                              <p className="text-2xl font-black text-foreground">#{order._id.slice(-6).toUpperCase()}</p>
                              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-500' : 
                                order.status === 'ready' ? 'bg-emerald-500/10 text-emerald-500' : 
                                order.status === 'pending' ? 'bg-amber-500/10 text-amber-500 animate-pulse' : 
                                order.status === 'preparing' ? 'bg-blue-500/10 text-blue-500' : 
                                order.status === 'cancelled' ? 'bg-red-500/10 text-red-500 opacity-50' :
                                'bg-red-500/10 text-red-500'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                              <p className="text-[10px] uppercase tracking-widest text-foreground/40">{order.user?.name || t('unknown')}</p>
                              <span className="w-1 h-1 rounded-full bg-foreground/20"></span>
                              <p className="text-[10px] uppercase tracking-widest text-foreground/40 font-bold">
                                {new Date(order.createdAt || Date.now()).toLocaleTimeString(locale === 'fr' ? 'fr-FR' : locale === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                          <Link href={`/admin/orders/${order._id}`}>
                            <button className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center text-gold hover:bg-gold hover:text-white transition-all">
                              <ExternalLink size={16} />
                            </button>
                          </Link>
                        </div>

                        {/* Order Type Info */}
                        <div className="bg-foreground/5 rounded-2xl p-4 flex items-center gap-4 mt-4">
                          {order.orderType === 'dine_in' && (
                            <>
                              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-black">
                                T{order.tableNumber}
                              </div>
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-foreground">{t('dineIn')}</p>
                                <p className="text-foreground/50 text-xs">{t('table')} {order.tableNumber}</p>
                              </div>
                            </>
                          )}
                          
                          {order.orderType === 'takeaway' && (
                            <>
                              <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                                <Package size={20} />
                              </div>
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-foreground">{t('takeaway')}</p>
                              </div>
                            </>
                          )}

                          {order.orderType === 'delivery' && (
                            <>
                              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                                <MapPin size={20} />
                              </div>
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-foreground mb-1">{t('delivery')}</p>
                                <p className="text-foreground/50 text-xs line-clamp-1">{order.deliveryDetails?.address}</p>
                              </div>
                            </>
                          )}

                          {!order.orderType && (
                            <div className="text-foreground/40 text-[10px] uppercase font-black tracking-widest flex items-center gap-2">
                               <CheckCircle2 size={16} className="text-gold" />
                               {t('modeNotDefined')}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

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
