import './globals.css';
const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL || (productionHost ? `https://${productionHost}` : 'https://relay-lime-alpha.vercel.app');
export const metadata = {
  metadataBase: new URL(siteOrigin),
  title: 'RELAY — Expert Know-How, Ready for Every Shift',
  description: 'Turn expert know-how into governed, portable Intelligence Pills. A Keppel AI HARVEST hackathon prototype.',
  openGraph: {title:'RELAY',description:'Expert know-how, safely reused across every building.',images:[`${process.env.NEXT_PUBLIC_BASE_PATH||''}/relay-cover.jpg`]},
};
export default function RootLayout({children}) {return <html lang="en"><body>{children}</body></html>;}
