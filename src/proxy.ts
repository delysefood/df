import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export function proxy(req: any) {
  return intlMiddleware(req);
}


export const config = {
  // Skip all paths that should not be internationalized
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)', '/', '/(fr|en|es|it|ar|de|tr|ru)/:path*']
};
