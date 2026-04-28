import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/routing";
import { LayoutDashboard, UtensilsCrossed, CalendarDays, ShoppingCart, Settings as SettingsIcon, LogOut, Star, Users, ScanLine } from 'lucide-react';
import dbConnect from "@/lib/db/mongodb";
import Settings from "@/models/Settings";
import { getTranslations } from "next-intl/server";

export default async function AdminLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);
  const t = await getTranslations({ locale, namespace: 'Admin' });

  if (!session || ((session.user as any).role !== 'admin' && (session.user as any).role !== 'super-admin' && (session.user as any).role !== 'server')) {
    redirect('/');
  }

  const role = (session.user as any).role;

  let settings = null;
  try {
    await dbConnect();
    settings = await Settings.findOne({ key: 'site_config' });
  } catch (dbError) {
    console.error("Failed to fetch settings in AdminLayout:", dbError);
  }

  const dLogo = settings?.logo || "/photos/logo%20delyse_food.png";

  const allNavItems = [
    { name: t('overview'), href: '/admin', icon: LayoutDashboard },
    { name: t('menu'), href: '/admin/menu', icon: UtensilsCrossed },
    { name: 'Tables', href: '/admin/tables', icon: LayoutDashboard },
    { name: t('reservations'), href: '/admin/reservations', icon: CalendarDays },
    { name: t('orders'), href: '/admin/orders', icon: ShoppingCart },
    { name: "Clients", href: '/admin/clients', icon: Users },
    { name: "Avis", href: '/admin/reviews', icon: Star },
    { name: "Scanner", href: '/admin/scanner', icon: ScanLine },
    { name: t('config'), href: '/admin/config', icon: SettingsIcon },
  ];

  const navItems = role === 'server' 
    ? allNavItems.filter(item => item.href === '/admin/orders' || item.href === '/admin/scanner')
    : allNavItems;

  return (
    <div className="flex min-h-screen bg-background pt-32 px-6 md:px-12 pb-12 gap-10">
      {/* Premium Sidebar */}
      <aside className="w-80 hidden lg:flex flex-col gap-10">
        <div className="glass-card rounded-[2.5rem] p-10 border border-border flex flex-col gap-12 sticky top-40">
           <div className="flex items-center gap-4">
              <div className="w-14 h-14 flex items-center justify-center p-1">
                 <img 
                    src={dLogo} 
                    alt="Logo" 
                    className={`w-full h-full object-contain ${!settings?.logo ? 'invert dark:invert-0' : ''}`} 
                 />
              </div>
              <div>
                 <h2 className="text-sm font-black text-foreground uppercase tracking-widest leading-none">Admin</h2>
                 <p className="text-[10px] font-black text-gold uppercase tracking-widest mt-1">Delyse Food</p>
              </div>
           </div>

           <nav className="flex flex-col gap-2">
             {navItems.map((item) => (
               <Link key={item.href} href={item.href as any}>
                  <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 hover:bg-foreground/5 text-foreground/40 hover:text-gold group">
                    <item.icon size={18} className="group-hover:scale-110 transition-transform" />
                    {item.name}
                  </button>
               </Link>
             ))}
           </nav>

           <div className="pt-8 border-t border-border mt-auto">
              <Link href="/">
                <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-foreground/20 hover:text-red-500 transition-colors">
                  <LogOut size={18} />
                  {t('logout')}
                </button>
              </Link>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 space-y-6 md:space-y-10 min-w-0">
        {/* Mobile Navigation */}
        <div className="lg:hidden flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
           {navItems.map((item) => (
             <Link key={item.href} href={item.href as any} className="flex-shrink-0">
                <button className="flex items-center gap-2 px-4 py-3 bg-foreground/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-foreground/80 hover:text-gold hover:bg-gold/10 transition-colors">
                  <item.icon size={16} />
                  {item.name}
                </button>
             </Link>
           ))}
        </div>

        {children}
      </main>
    </div>
  );
}
