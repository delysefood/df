'use client';

import { signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const router = useRouter();
  const t = useTranslations('Auth');

  useEffect(() => {
    fetch('/api/admin/settings', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => setSettings(data));
  }, []);

  const dLogo = settings?.logo || "/photos/logo%20delyse_food.png";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);
    if (res?.error) {
      if (res.error !== 'CredentialsSignin' && res.error) {
        setError(res.error);
      } else {
        setError(t('invalidError'));
      }
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 pt-32">
      <div className="absolute top-0 right-0 w-[40%] h-full bg-gold/5 blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-[40%] h-full bg-gold/5 blur-3xl -z-10" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-10 space-y-4">
           <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-20 h-20 flex items-center justify-center p-1 group-hover:scale-110 transition-all duration-500">
                 <img src={dLogo} alt="Logo" className={`w-full h-full object-contain ${!settings?.logo ? 'invert dark:invert-0' : ''}`} />
              </div>
           </Link>
           <h1 className="text-4xl font-black tracking-tight text-foreground">Bon Retour !</h1>
           <p className="text-foreground/40 font-bold text-sm tracking-widest uppercase">Connectez-vous pour commander</p>
        </div>

        <div className="glass-card rounded-[2.5rem] p-8 md:p-12 border border-border">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gold ml-2">{t('email')}</label>
              <div className="relative">
                 <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-foreground/20" size={18} />
                 <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="w-full bg-foreground/5 dark:bg-white/5 border-none rounded-2xl px-14 py-4 text-sm font-bold text-foreground placeholder:text-foreground/20 focus:ring-2 focus:ring-gold/50 transition-all outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gold">{t('password')}</label>
                <button type="button" className="text-[9px] font-black uppercase tracking-widest text-foreground/40 hover:text-gold transition-colors">Oublié ?</button>
              </div>
              <div className="relative">
                 <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-foreground/20" size={18} />
                 <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-foreground/5 dark:bg-white/5 border-none rounded-2xl px-14 py-4 text-sm font-bold text-foreground placeholder:text-foreground/20 focus:ring-2 focus:ring-gold/50 transition-all outline-none"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gold text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-gold/20 disabled:opacity-50 disabled:scale-100"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
                <>
                  <span className="uppercase tracking-[0.2em] text-[10px]">{t('signInBtn')}</span>
                  <LogIn size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-border text-center">
             <p className="text-foreground/30 text-[10px] font-black uppercase tracking-widest mb-4">Pas encore de compte ?</p>
             <Link href="/auth/signup">
                <button className="text-gold font-black uppercase tracking-widest text-[10px] hover:underline flex items-center gap-2 mx-auto">
                   Créer un compte <ArrowRight size={14} />
                </button>
             </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
